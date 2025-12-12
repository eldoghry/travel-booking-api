import { Test, TestingModule } from "@nestjs/testing";
import { PayPalStrategy } from "../../strategies/paypal.strategy";
import { PayPalService } from "../../services/paypal.service";
import { TransactionService } from "src/modules/transaction/transaction.service";
import { async } from "rxjs";
import { PaymentProvider } from "../../enums/payment-methods.enum";
import { BookingType, TransactionPaymentStatus } from "src/modules/transaction/enums/transaction.enum";
import { CreatePaymentDto } from "../../dto/create-payment.dto";
import { PayPalWebhookEvent } from "../../interfaces/paypal.interface";
import { AuditEventType } from "src/modules/audit/enums/audit-event.enum";

const mockPaypalService = {
    createOrder: jest.fn(),
    verifyWebhookSignature: jest.fn(),
    handleAuditPayment: jest.fn(),
    handleApprovalPayment: jest.fn(),
    handleCapturePayment: jest.fn(),
    handlePaymentCompleted: jest.fn(),
    handlePaymentFailed: jest.fn()
}

const mockTransactionService = {
    addNewTransaction: jest.fn(),
    getOneTransactionOrFailBy: jest.fn(),
    updateTransaction: jest.fn(),
    addTransactionDetail: jest.fn()
}

const mockCreatePaymentDto: CreatePaymentDto = {
    amount: 2,
    currency: "USD",
    provider: PaymentProvider.PAYPAL,
    customerId: 123456,
    bookingId: 555,
    bookingType: BookingType.Hotel,
    paymentMethodId: 1
}

describe('PayPalStrategy', () => {
    let paypalStrategy: PayPalStrategy;
    let paypalService: typeof mockPaypalService;
    let transactionService: typeof mockTransactionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PayPalStrategy, { provide: PayPalService, useValue: mockPaypalService }, { provide: TransactionService, useValue: mockTransactionService }],
        }).compile();
        paypalStrategy = module.get<PayPalStrategy>(PayPalStrategy);
        paypalService = module.get<typeof mockPaypalService>(PayPalService);
        transactionService = module.get<typeof mockTransactionService>(TransactionService);

        jest.clearAllMocks()
    })

    describe('initiatePayment', () => {
        const { customerId, bookingType, bookingId, paymentMethodId, amount, currency } = mockCreatePaymentDto
        const mockTransaction = { transactionId: 999 }
        const mockOrder = {
            id: "ORDER123",
            links: [
                { rel: "approve", href: "https://paypal.com/approve" }
            ]
        }
        describe('Success', () => {
            beforeEach(async () => {
                // Mock transaction created
                transactionService.addNewTransaction.mockResolvedValue(mockTransaction);

                // Mock PayPal order created
                paypalService.createOrder.mockResolvedValue(mockOrder);

                await paypalStrategy.initiatePayment(mockCreatePaymentDto)
            })

            it('Should create a transaction BEFORE calling PayPal', async () => {
                const mockTransactionBody = {
                    customerId, bookingType, bookingId, paymentMethodId, amount, currency, status: TransactionPaymentStatus.INITIATED
                }

                expect(transactionService.addNewTransaction).toHaveBeenCalledWith(mockTransactionBody)
            })

            it('Should call paypalService.createOrder with correct params', async () => {
                expect(paypalService.createOrder).toHaveBeenCalledWith(amount, currency)
            })

            it('Should add transaction detail (success)', async () => {

                const mockTransactionDetailBody = {
                    transactionId: mockTransaction?.transactionId,
                    provider: PaymentProvider.PAYPAL,
                    action: "create_order",
                    requestPayload: { amount, currency, customerId, bookingType, bookingId, paymentMethodId },
                    responsePayload: mockOrder,
                    success: true
                }
                expect(transactionService.addTransactionDetail).toHaveBeenCalledWith(mockTransactionDetailBody)
            })

            it('Should update transaction to CREATED', async () => {
                const mockUpdateTransactionBody = {
                    orderId: mockOrder?.id,
                    status: TransactionPaymentStatus.CREATED
                }
                expect(transactionService.updateTransaction).toHaveBeenCalledWith(mockTransaction?.transactionId, mockUpdateTransactionBody)
            })

            it('Should return orderId + approvalUrl', async () => {
                expect(paypalStrategy.initiatePayment(mockCreatePaymentDto)).resolves.toEqual({
                    orderId: mockOrder?.id,
                    approvalUrl: mockOrder?.links[0].href
                })
            })
        })

        describe('Error', () => {
            const mockError = {
                message: "Failed to create PayPal order",
                // stack: "stack-trace",
                response: {
                    data: { code: "ERR_ORDER" }
                }
            };
            beforeEach(async () => {
                paypalService.createOrder.mockRejectedValue(new Error('Failed to create PayPal order'));
                await expect(paypalStrategy.initiatePayment(mockCreatePaymentDto)).rejects.toThrow('Failed to create PayPal order');
            })
            it('Should add transaction details if createOrder failed', async () => {
                const mockTransactionDetailBody = {
                    transactionId: mockTransaction?.transactionId,
                    provider: PaymentProvider.PAYPAL,
                    action: "create_order",
                    requestPayload: { amount, currency, customerId, bookingType, bookingId, paymentMethodId },
                    responsePayload: null,
                    success: false,
                    errorStack: expect.objectContaining({
                        message: mockError.message,
                        // stack: mockError.stack, // will not test this because it diff in diff environment
                        details: undefined
                    })
                }

                expect(transactionService.addTransactionDetail).toHaveBeenCalledWith(mockTransactionDetailBody)
            })

            it('Should update transaction to FAILED if createOrder failed', () => {
                const mockUpdateTransactionBody = {
                    status: TransactionPaymentStatus.FAILED
                }
                expect(transactionService.updateTransaction).toHaveBeenCalledWith(mockTransaction?.transactionId, mockUpdateTransactionBody)
            })

            it('Should throw error if createOrder failed', () => {
                expect(paypalStrategy.initiatePayment(mockCreatePaymentDto)).rejects.toThrow('Failed to create PayPal order')
            })
        })
    })

    describe('handleWebhook', () => {
        const mockEvent: PayPalWebhookEvent = {
            id: "WH-COC11055RA711503B-4YM959094A144403T",
            resource_type: "checkout-order",
            event_type: "CHECKOUT.ORDER.APPROVED",
            summary: "An order has been approved by buyer",
            resource: {
                update_time: "2018-04-01T21:20:49Z",
                create_time: "2018-04-01T21:18:49Z",
                purchase_units: [
                    {
                        reference_id: "d9f80740-38f0-11e8-b467-0ed5f89f718b",
                        amount: {
                            currency_code: "USD",
                            value: "100.00"
                        }
                    }
                ],
                id: "5O190127TN364715T",
                intent: "CAPTURE",
                payer: {
                    name: {
                        given_name: "John",
                        surname: "Doe"
                    },
                    email_address: "customer@example.com",
                    payer_id: "QYR5Z8XDVJNXQ"
                },
                status: "APPROVED"
            }
        }
        const mockRequest = {
            body: mockEvent, headers: {}, method: 'POST',
            url: '/payments/webhooks/paypal'
        } as unknown as Request & { body: PayPalWebhookEvent }

        const mockEventResource = mockEvent?.resource
        const mockOrderId = mockEventResource.id
        beforeEach(async () => {
            await paypalStrategy.handleWebhook(mockRequest)
        })

        describe('Success', () => {
            it('Should verify webhook signature', () => {
                expect(paypalService.verifyWebhookSignature).toHaveBeenCalledWith(mockRequest)
            })

            it('Should record correct audit event type for known event', () => {
                const mockAuditBody = {
                    auditEventType: AuditEventType.PROVIDER_CHECKOUT_ORDER_APPROVED,
                    auditData: {
                        payload: mockEvent,
                        metadata: {
                            provider: PaymentProvider.PAYPAL
                        }
                    }
                }
                expect(paypalService.handleAuditPayment).toHaveBeenCalledWith(mockAuditBody)
            })

            describe('Event Routing / Handling', () => {
                it('Should route to correct event handler', async () => {
                    mockEvent.event_type = "CHECKOUT.ORDER.APPROVED"
                    await paypalStrategy.handleWebhook(mockRequest);
                    expect(paypalStrategy.handleWebhook(mockRequest)).resolves.toEqual({
                        status: "OK"
                    })
                })

                it('Should call handleApprovalPayment with correct orderId if CHECKOUT.ORDER.APPROVED', async () => {
                    mockEvent.event_type = "CHECKOUT.ORDER.APPROVED"
                    await paypalStrategy.handleWebhook(mockRequest);
                    expect(paypalService.handleApprovalPayment).toHaveBeenCalledWith(mockOrderId)
                })

                it('Should call handleCapturePayment after handleApprovalPayment', async () => {
                    mockEvent.event_type = "CHECKOUT.ORDER.APPROVED"
                    await paypalStrategy.handleWebhook(mockRequest);
                    expect(paypalService.handleCapturePayment).toHaveBeenCalledWith({ orderId: mockOrderId })
                })

                it('Should call handlePaymentCompleted with resource if PAYMENT.CAPTURE.COMPLETED', async () => {
                    mockEvent.event_type = "PAYMENT.CAPTURE.COMPLETED"
                    await paypalStrategy.handleWebhook(mockRequest);
                    expect(paypalService.handlePaymentCompleted).toHaveBeenCalledWith(mockEventResource)
                })

                it('Should call handlePaymentFailed with resource if PAYMENT.CAPTURE.DENIED', async () => {
                    mockEvent.event_type = "PAYMENT.CAPTURE.DENIED"
                    await paypalStrategy.handleWebhook(mockRequest);
                    expect(paypalService.handlePaymentFailed).toHaveBeenCalledWith(mockEventResource)
                })

                it('Should call handlePaymentFailed with resource if PAYMENT.CAPTURE.DECLINED', async () => {
                    mockEvent.event_type = "PAYMENT.CAPTURE.DECLINED"
                    await paypalStrategy.handleWebhook(mockRequest);
                    expect(paypalService.handlePaymentFailed).toHaveBeenCalledWith(mockEventResource)
                })
                it('Return {status: "OK"} if event is handled successfully', () => {
                    expect(paypalStrategy.handleWebhook(mockRequest)).resolves.toEqual({
                        status: "OK"
                    })
                })
                it('Return {status: "OK"} if event is not handled', () => {
                    mockEvent.event_type = "PAYMENT.AUTHORIZATION.CREATED"
                    expect(paypalStrategy.handleWebhook(mockRequest)).resolves.toEqual({
                        status: "OK"
                    })
                })

            })
        })

        describe('Error', () => {
            it('Return {status: "ignored_error"} if verifyWebhookSignature failed', async () => {
                paypalService.verifyWebhookSignature.mockRejectedValue(
                    new Error('Error in verifyWebhookSignature')
                );

                await expect(paypalStrategy.handleWebhook(mockRequest)).resolves.toEqual({
                    status: "ignored_error"
                });
            });
        });

    })
})