import { Injectable, BadRequestException } from '@nestjs/common';
import { PayPalStrategy } from './strategies/paypal.strategy';
import { StripeStrategy } from './strategies/stripe.strategy';
import { PaymentStrategy } from './interfaces/payment-strategy.interface';

@Injectable()
export class PaymentFactory {
  constructor(
    private readonly paypalStrategy: PayPalStrategy,
    private readonly stripeStrategy: StripeStrategy,
  ) {}

  getStrategy(provider: string): PaymentStrategy {
    switch (provider.toLowerCase()) {
      case 'paypal':
        return this.paypalStrategy;
      case 'stripe':
        return this.stripeStrategy;
      default:
        throw new BadRequestException(`Unsupported payment provider: ${provider}`);
    }
  }
}
