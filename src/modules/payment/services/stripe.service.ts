import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY')!, {
      apiVersion: '2025-11-17.clover', // Updated to match installed package version
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    idempotencyKey: string,
    metadata: any,
    captureMethod: 'automatic' | 'manual' = 'automatic',
  ): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create(
      {
        amount,
        currency,
        metadata,
        capture_method: captureMethod,
        automatic_payment_methods: {
          enabled: true,
        },
      },
      {
        idempotencyKey,
      },
    );
  }

  async capturePayment(paymentIntentId: string, amountToCapture?: number): Promise<Stripe.PaymentIntent> {
    const options: Stripe.PaymentIntentCaptureParams = {};
    if (amountToCapture) {
      options.amount_to_capture = amountToCapture;
    }
    return this.stripe.paymentIntents.capture(paymentIntentId, options);
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  async constructEvent(payload: any, signature: string): Promise<Stripe.Event> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }
    return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  }
}
