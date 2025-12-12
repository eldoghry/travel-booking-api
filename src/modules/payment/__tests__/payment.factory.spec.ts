import { Test, TestingModule } from "@nestjs/testing"
import { PayPalStrategy } from "../strategies/paypal.strategy"
import { PaymentFactory } from "../payment.factory"
import { StripeStrategy } from "../strategies/stripe.strategy"
import { PaymentProvider } from "../enums/payment-methods.enum"


const mockPaypalStrategy = {
    handleWebhook: jest.fn()
}

const mockStripeStrategy = {
    handleWebhook: jest.fn()
}


describe('PaymentFactory', () => {
    let factory: PaymentFactory;
    let paypalStrategy: typeof mockPaypalStrategy;
    let stripeStrategy: typeof mockStripeStrategy;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentFactory,
                { provide: PayPalStrategy, useValue: mockPaypalStrategy },
                { provide: StripeStrategy, useValue: mockStripeStrategy }
            ]
        }).compile()

        factory = module.get<PaymentFactory>(PaymentFactory)
        paypalStrategy = module.get<typeof mockPaypalStrategy>(PayPalStrategy)
        stripeStrategy = module.get<typeof mockStripeStrategy>(StripeStrategy)
        jest.clearAllMocks()
    })

    it('Should choose paypal strategy if provider is paypal', () => {
        const mockProvider = PaymentProvider.PAYPAL
        const strategy = factory.getStrategy(mockProvider)
        expect(strategy).toBe(paypalStrategy)
    })


    it('Should choose stripe strategy if provider is stripe', () => {
        const mockProvider = PaymentProvider.STRIPE
        const strategy = factory.getStrategy(mockProvider)
        expect(strategy).toBe(stripeStrategy)
    })

    it('Should throw error if provider is not supported', () => {
        const mockProvider = 'invalid'
        expect(() => factory.getStrategy(mockProvider)).toThrow(`Unsupported payment provider: ${mockProvider}`)
    })

})