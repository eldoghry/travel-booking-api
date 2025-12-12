import { Test, TestingModule } from "@nestjs/testing"
import { PaymentService } from "../../services/payment.service"
import { PaymentFactory } from "../../payment.factory"
import { PayPalWebhookEvent } from "../../interfaces/paypal.interface"
import { PaymentProvider } from "../../enums/payment-methods.enum"
import { CreatePaymentDto } from "../../dto/create-payment.dto"
import { BookingType } from "src/modules/transaction/enums/transaction.enum"


const mockPaymentFactory = {
    getStrategy: jest.fn()
}

const mockStrategy = {
    initiatePayment: jest.fn(),
    handleWebhook: jest.fn()
}

describe('PaymentService', () => {
    let service: PaymentService;
    let paymentFactory: typeof mockPaymentFactory;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PaymentService, { provide: PaymentFactory, useValue: mockPaymentFactory }]
        }).compile()

        service = module.get<PaymentService>(PaymentService)
        paymentFactory = module.get<typeof mockPaymentFactory>(PaymentFactory)
        paymentFactory.getStrategy.mockReturnValue(mockStrategy) 
        jest.clearAllMocks()
    })

    describe('initiatePayment', () => {
        it('Should call initiatePayment in PayPalStrategy if the provider is PayPal', async () => {
            const mockBodyDto : CreatePaymentDto = {
                amount: 2,
                currency: "USD",
                provider: PaymentProvider.PAYPAL,
                customerId: 123456,
                bookingId: 555,
                bookingType: BookingType.Hotel,
                paymentMethodId: 1
            }

            await service.initiatePayment(mockBodyDto)
            expect(paymentFactory.getStrategy).toHaveBeenCalledWith(mockBodyDto.provider)
            expect(mockStrategy.initiatePayment).toHaveBeenCalledWith(mockBodyDto)

        })

        it('Should call initiatePayment in StripeStrategy if the provider is Stripe',async()=>{})
    }) 

    describe('handleWebhook', () => {
        it('Should call handleWebhook in PayPalStrategy if the provider is PayPal', async () => {

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
            const mockProvider = PaymentProvider.PAYPAL


            await service.handleWebhook(mockRequest, mockProvider)

            expect(paymentFactory.getStrategy).toHaveBeenCalledWith(mockProvider)
            expect(mockStrategy.handleWebhook).toHaveBeenCalledWith(mockRequest)
        })

        it('Should call handleWebhook in StripeStrategy if the provider is Stripe', () => {

        })
    })

}) 