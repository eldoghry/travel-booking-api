import { Test, TestingModule } from "@nestjs/testing";
import { PaymentController } from "../payment.controller";
import { PaymentService } from "../services/payment.service";
import { PayPalWebhookEvent } from "../interfaces/paypal.interface";
import { PaymentProvider } from "../enums/payment-methods.enum";



const mockPaymentService: Partial<Record<keyof PaymentService, jest.Mock>> = {
    handleWebhook: jest.fn()
}

describe('PaymentController', () => {
    let controller: PaymentController;
    let paymentService: PaymentService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentController],
            providers: [{ provide: PaymentService, useValue: mockPaymentService }],
        }).compile();

        controller = module.get<PaymentController>(PaymentController)
        paymentService = module.get<PaymentService>(PaymentService)
        jest.clearAllMocks()
    })

    describe('PayPal Webhooks', () => {
        it('Should call handleWebhook after order approval', async () => {
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
            };

            const mockRequest = {
                body: mockEvent , headers: {}, method: 'POST',
                url: '/payments/webhooks/paypal'
            } as unknown as Request & { body: PayPalWebhookEvent }
            await controller.handlePayPalWebhooks(mockRequest)
            expect(paymentService.handleWebhook).toHaveBeenCalledTimes(1)
            expect(paymentService.handleWebhook).toHaveBeenCalledWith(mockRequest, PaymentProvider.PAYPAL)
            // expect(result).toEqual({ ok: true });

        })

        it('Should call handleWebhook after payment capture', async () => {
            const mockEvent: PayPalWebhookEvent = {
                id: "WH-7Y7254563A4550640-11V2185806837105M",
                create_time: "2015-02-17T18:51:33Z",
                resource_type: "capture",
                event_type: "PAYMENT.CAPTURE.COMPLETED",
                summary: "Payment completed for $ 57.0 USD",
                resource: {
                    disbursement_mode: "DELAYED",
                    amount: {
                        currency_code: "USD",
                        value: "57.00"
                    },
                    create_time: "2022-08-26T18:29:50Z",
                    custom_id: "d93e4fcb-d3af-137c-82fe-1a8101f1ad11",
                    update_time: "2022-08-26T18:29:50Z",
                    final_capture: true,
                    invoice_id: "3942619:fdv09c49-a3g6-4cbf-1358-f6d241dacea2",
                    id: "42311647XV020574X",
                    status: "COMPLETED"
                }
            }

            const mockRequest = {
                body: mockEvent, headers: {}, method: 'POST',
                url: '/payments/webhooks/paypal'
            } as unknown as Request & { body: PayPalWebhookEvent }
            await controller.handlePayPalWebhooks(mockRequest)
            expect(paymentService.handleWebhook).toHaveBeenCalledTimes(1)
            expect(paymentService.handleWebhook).toHaveBeenCalledWith(mockRequest, PaymentProvider.PAYPAL)
        })

        it('Should call handleWebhook after payment failed', async () => {

            const mockEvent: PayPalWebhookEvent = {
                id: "WH-6HE329230C693231F-5WV60586YA659351G",
                create_time: "2022-12-13T19:13:07.251Z",
                resource_type: "capture",
                event_type: "PAYMENT.CAPTURE.DECLINED",
                summary: "A payment capture for $ 185.1 USD was declined.",
                resource: {
                    disbursement_mode: "INSTANT",
                    amount: {
                        currency_code: "USD",
                        value: "185.10"
                    },
                    create_time: "2022-12-13T19:13:00Z",
                    custom_id: "CUSTOMID-1001",
                    update_time: "2022-12-13T19:13:00Z",
                    final_capture: false,
                    invoice_id: "ARG0-2022-12-08T21:00:21.564Z-435",
                    id: "7U133281TB3277326",
                    status: "DECLINED"
                },
                event_version: "1.0",
                resource_version: "2.0"
            }

            const mockRequest = {
                body: mockEvent, headers: {}, method: 'POST',
                url: '/payments/webhooks/paypal'
            } as unknown as Request & { body: PayPalWebhookEvent }
            await controller.handlePayPalWebhooks(mockRequest)
            expect(paymentService.handleWebhook).toHaveBeenCalledTimes(1)
            expect(paymentService.handleWebhook).toHaveBeenCalledWith(mockRequest, PaymentProvider.PAYPAL)
        })

        it('Should handle Unhandled webhook event', async () => {
            const mockEvent: PayPalWebhookEvent = {
                id: "WH-0J4956174R483764T-3MK691094K212612H",
                create_time: "2015-05-11T21:45:16Z",
                resource_type: "capture",
                event_type: "PAYMENT.CAPTURE.PENDING",
                summary: "Payment pending for EUR 2.25 EUR",
                resource: {
                    parent_payment: "PAY-02U23179LV908860DKVISFGA",
                    update_time: "2015-05-11T21:44:46Z",
                    amount: {
                        total: "2.25",
                        currency: "EUR"
                    },
                    create_time: "2015-05-11T21:44:42Z",
                    id: "0C90432034385860N",
                    state: "pending"
                }
            }

            const mockRequest = {
                body: mockEvent, headers: {}, method: 'POST',
                url: '/payments/webhooks/paypal'
            } as unknown as Request & { body: PayPalWebhookEvent }

            const loggerSpy = jest.spyOn(controller['logger'], 'log');

            await controller.handlePayPalWebhooks(mockRequest)
            expect(loggerSpy).toHaveBeenCalledWith(`Received PayPal unhandled webhook event: ${mockEvent.event_type}`)
            expect(paymentService.handleWebhook).not.toHaveBeenCalled()
        })
    })
});