import nock from "nock";
import { BookingType, TransactionPaymentStatus } from "src/modules/transaction/enums/transaction.enum";
import { TransactionService } from "src/modules/transaction/transaction.service";
import { clearDatabase, setupTestApp, teardownTestApp, TestAppContext } from "../../../../test/testcontainers-setup";
import request from 'supertest';
import { PayPalWebhookEvent } from "../interfaces/paypal.interface";
import { PayPalService } from "../services/paypal.service";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import { RedisService } from "src/common/redis/redis.service";
import { PayPalStrategy } from "../strategies/paypal.strategy";

describe('PaymentModule (Integration)', () => {
    let testContext: TestAppContext;
    let transactionService: TransactionService;
    let paypalStrategy: PayPalStrategy;
    let paypalService: PayPalService;
    let configService: ConfigService;
    let transactionId: number;
    let dataSource: DataSource;
    let redisService: RedisService;
    let paypalBaseUrl: string;
    const orderId = '5O190127TN364715RO';

    describe('POST /api/v1/payments/webhooks/paypal', () => {
        beforeAll(async () => {
            try {

                testContext = await setupTestApp({ withDatabase: true, withRabbitMQ: true });
                paypalStrategy = testContext.app.get(PayPalStrategy)
                paypalService = testContext.app.get(PayPalService)
                transactionService = testContext.app.get(TransactionService)
                configService = testContext.app.get(ConfigService)
                dataSource = testContext.app.get(DataSource)
                redisService = testContext.app.get(RedisService)
                paypalBaseUrl = configService.get('PAYPAL_BASE_URL') || 'https://api-m.sandbox.paypal.com';

                // moke redis and audit with return undefined or null to stop the function from running
                jest.spyOn(redisService, 'get').mockResolvedValue(null);
                jest.spyOn(redisService, 'set').mockResolvedValue(undefined);
                jest.spyOn(paypalService, 'handleAuditPayment').mockResolvedValue(undefined);
                jest.spyOn(transactionService, 'handleAuditTransaction').mockResolvedValue(undefined);


            } catch (error) {
                console.error('Failed to setup test:', error);
                throw error;
            }
        })

        beforeEach(async () => {
            await redisService.getClient().flushall(); // Clear Redis 

            jest.spyOn(paypalService, 'verifyWebhookSignature').mockResolvedValue(true);

            await clearDatabase(dataSource); // Clear database
            // Create a fresh transaction for each test
            const transaction = await transactionService.addNewTransaction({
                customerId: 123,
                bookingType: BookingType.Flight,
                bookingId: 1234,
                paymentMethodId: 1,
                amount: 100,
                currency: 'USD',
                status: TransactionPaymentStatus.INITIATED
            });

            transactionId = transaction.transactionId!;

            await transactionService.updateTransaction(transactionId, {
                orderId: orderId,
                status: TransactionPaymentStatus.CREATED
            });
        });

        afterEach(() => {
            jest.clearAllMocks();
            nock.cleanAll(); // Clean up nock after each test
        });

        afterAll(async () => {
            await teardownTestApp(testContext);
        }, 30000);

        it('Webhook: CHECKOUT.ORDER.APPROVED', async () => {

            const mockEvent: PayPalWebhookEvent = {
                id: "WH-COC11055RA711503B-4YM959094A144403M",
                resource_type: "checkout-order",
                event_type: "CHECKOUT.ORDER.APPROVED",
                summary: "An order has been approved by buyer",
                resource: {
                    update_time: "2018-04-01T21:20:49Z",
                    create_time: "2018-04-01T21:18:49Z",
                    purchase_units: [
                        {
                            reference_id: "d9f80740-38f0-11e8-b467-0ed5f89f718a",
                            amount: {
                                currency_code: "USD",
                                value: "100.00"
                            }
                        }
                    ],
                    id: orderId,
                    intent: "CAPTURE",
                    status: "APPROVED"
                }
            };

            // Mock getAccessToken
            nock(paypalBaseUrl)
                .post('/v1/oauth2/token')
                .reply(200, {
                    access_token: 'mock-access-token-1235',
                    token_type: 'Bearer',
                    expires_in: 3600
                }).persist() // persist() because getAccessToken might be called multiple times

            // Mock the capture order API call
            nock(paypalBaseUrl)
                .post(`/v2/checkout/orders/${orderId}/capture`)
                .reply(200, {
                    purchase_units: [{
                        reference_id: 'ref-1253',
                        payments: {
                            captures: [{ id: 'cap-1253' }]
                        }
                    }]
                });

            await request(testContext!.app.getHttpServer())
                .post('/api/v1/payments/webhooks/paypal')
                .send(mockEvent)
                .set('Content-Type', 'application/json')
                .set('paypal-transmission-id', '1234')
                .set('paypal-transmission-sig', 'abcd')
                .set('paypal-cert-url', 'https://example.com/cert')
                .set('paypal-auth-algo', 'SHA250')
                .set('paypal-transmission-time', new Date().toISOString())
                .expect(201);


            const updatedTransaction = await transactionService.getOneTransactionOrFailBy({ orderId });
            expect(updatedTransaction.status).toBe(TransactionPaymentStatus.CAPTURED);

            expect(nock.isDone()).toBe(true); // This ensures all mocked endpoints were called
        });

        it('Webhook: PAYMENT.CAPTURE.COMPLETED', async () => {
            const mockEvent: PayPalWebhookEvent = {
                id: "WH-COC11055RA711503B-4YM959094A144404M",
                resource_type: "capture",
                event_type: "PAYMENT.CAPTURE.COMPLETED",
                summary: "A payment capture has been completed",
                resource: {
                    id: "CAP-1234567891",
                    status: "COMPLETED",
                    amount: {
                        currency_code: "USD",
                        value: "100.00"
                    },
                    final_capture: true,
                    invoice_id: "INV-12345",
                    seller_protection: {
                        status: "ELIGIBLE",
                        dispute_categories: ["ITEM_NOT_RECEIVED", "UNAUTHORIZED_TRANSACTION"]
                    },
                    create_time: "2025-12-22T12:00:00Z",
                    update_time: "2025-12-22T12:01:00Z",
                    payment_id: orderId,
                    supplementary_data: { related_ids: { order_id: orderId } },
                }
            };

            await request(testContext!.app.getHttpServer())
                .post('/api/v1/payments/webhooks/paypal')
                .send(mockEvent)
                .set('Content-Type', 'application/json')
                .set('paypal-transmission-id', '1235')
                .set('paypal-transmission-sig', 'abcdk')
                .set('paypal-cert-url', 'https://example.com/cert')
                .set('paypal-auth-algo', 'SHA240')
                .set('paypal-transmission-time', new Date().toISOString())
                .expect(201);


            const updatedTransaction = await transactionService.getOneTransactionOrFailBy({ orderId });
            expect(updatedTransaction.status).toBe(TransactionPaymentStatus.COMPLETED);
        })

        it('Webhook: PAYMENT.CAPTURE.DENIED / PAYMENT.CAPTURE.DECLINED', async () => {
            const mockEvent: PayPalWebhookEvent = {
                id: "WH-COC11055RA711503B-4YM959094A144405D",
                resource_type: "capture",
                event_type: "PAYMENT.CAPTURE.DENIED",
                summary: "A payment capture has been denied",
                resource: {
                    id: "CAP-9876543210",
                    status: "DENIED",
                    amount: {
                        currency_code: "USD",
                        value: "100.00"
                    },
                    final_capture: true,
                    create_time: "2025-12-22T12:05:00Z",
                    update_time: "2025-12-22T12:06:00Z",
                    payment_id: orderId,
                    reason: "INSUFFICIENT_FUNDS",
                    supplementary_data: { related_ids: { order_id: orderId } },

                }
            };

            await request(testContext!.app.getHttpServer())
                .post('/api/v1/payments/webhooks/paypal')
                .send(mockEvent)
                .set('Content-Type', 'application/json')
                .set('paypal-transmission-id', '1235')
                .set('paypal-transmission-sig', 'abcdk')
                .set('paypal-cert-url', 'https://example.com/cert')
                .set('paypal-auth-algo', 'SHA240')
                .set('paypal-transmission-time', new Date().toISOString())
                .expect(201);


            const updatedTransaction = await transactionService.getOneTransactionOrFailBy({ orderId });
            expect(updatedTransaction.status).toBe(TransactionPaymentStatus.FAILED);
        })

        it('Webhook: Unknown Event Type', async () => {
            const mockEvent: PayPalWebhookEvent = {
                id: "WH-COC11055RA711503B-4YM959094A144405D",
                resource_type: "capture",
                event_type: "PAYMENT.CAPTURE.PENDING",
                summary: "A payment capture is pending",
                resource: {
                    id: "CAP-9876543210",
                    status: "PENDING",
                    amount: {
                        currency_code: "USD",
                        value: "100.00"
                    },
                    final_capture: true,
                    create_time: "2025-12-22T12:05:00Z",
                    update_time: "2025-12-22T12:06:00Z",
                    payment_id: orderId,
                    reason: "PENDING",
                    supplementary_data: { related_ids: { order_id: orderId } },
                }
            };

            await request(testContext!.app.getHttpServer())
                .post('/api/v1/payments/webhooks/paypal')
                .send(mockEvent)
                .set('Content-Type', 'application/json')
                .set('paypal-transmission-id', '1235')
                .set('paypal-transmission-sig', 'abcdk')
                .set('paypal-cert-url', 'https://example.com/cert')
                .set('paypal-auth-algo', 'SHA240')
                .set('paypal-transmission-time', new Date().toISOString())
                .expect(201);

            const spyHandleWebhook = jest.spyOn(paypalStrategy, 'handleWebhook');
            expect(spyHandleWebhook).not.toHaveBeenCalled();
        })
    });
});