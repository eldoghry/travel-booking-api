import { PaymentStrategy } from '../interfaces/payment-strategy.interface';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { CaptureStripePaymentDto } from '../dto/capture-stripe-payment.dto';
import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { StripeService } from '../services/stripe.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IdempotencyKey } from '../../transaction/entities/idempotency-key.entity';
import { TransactionService } from '../../transaction/transaction.service';
import { TransactionPaymentStatus, BookingType } from '../../transaction/enums/transaction.enum';
import { PaymentProvider } from '../enums/payment-methods.enum';
import { PaymentAction } from '../enums/payment-actions.enum';
import Stripe from 'stripe';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class StripeStrategy implements PaymentStrategy {
    private readonly logger = new Logger(StripeStrategy.name);

    constructor(
        private readonly stripeService: StripeService,
        @InjectRepository(IdempotencyKey)
        private readonly idempotencyKeyRepository: Repository<IdempotencyKey>,
        private readonly transactionService: TransactionService,
    ) { }

    @Transactional()
    async initiatePayment(body: CreatePaymentDto): Promise<any> {
        const { amount, currency, bookingId, bookingType } = body;
        const key = `booking-${bookingType}-${bookingId}`;

        this.logger.log(`Initiating payment for booking ${bookingId} (${bookingType})`);

        // TODO: [Security] Fetch booking details to validate price server-side.
        // await this.fetchBookingDetails(bookingId, bookingType);

        // 1. Check Idempotency
        const existingResponse = await this.checkIdempotency(key);
        if (existingResponse) {
            return existingResponse;
        }

        // 2. Create Transaction
        const transaction = await this.createTransactionRecord(body);

        try {
            // 3. Create PaymentIntent
            const paymentIntent = await this.createStripePaymentIntent(amount, currency, key, {
                transactionId: transaction.transactionId,
                bookingId,
                bookingType,
            }, 'manual');

            const response = {
                clientSecret: paymentIntent.client_secret,
                transactionId: transaction.transactionId,
            };

            // 4. Save Transaction Detail
            await this.saveTransactionDetails(transaction.transactionId, paymentIntent);

            // 5. Save Idempotency Key
            await this.saveIdempotencyKey(key, transaction.transactionId);

            this.logger.log(`Payment initiated successfully for transaction ${transaction.transactionId}`);
            return response;
        } catch (error: any) {
            this.logger.error(`Failed to initiate payment for transaction ${transaction.transactionId}`, error.stack);
            await this.transactionService.addTransactionStatusLog({
                transactionId: transaction.transactionId,
                status: TransactionPaymentStatus.FAILED,
            });
            throw error;
        }
    }

    private async checkIdempotency(key: string): Promise<any | null> {
        const existingKey = await this.idempotencyKeyRepository.findOne({ where: { key } });
        if (!existingKey) return null;

        this.logger.log(`Idempotency key found for ${key}, returning existing transaction`);
        const transaction = await this.transactionService.getOneTransactionOrFailBy({ transactionId: existingKey.transactionId });

        const detail = transaction.details?.find(
            (d) => d.action === PaymentAction.CREATE_PAYMENT_INTENT,
        );

        if (detail && detail.responsePayload) {
            return {
                clientSecret: detail.responsePayload.client_secret,
                transactionId: transaction.transactionId,
            };
        }

        this.logger.warn(`Payment details not found for transaction: ${transaction.transactionId}`);
        throw new NotFoundException(`Payment details not found for transaction: ${transaction.transactionId}`);
    }

    private async createTransactionRecord(body: CreatePaymentDto) {
        return await this.transactionService.addNewTransaction({
            amount: body.amount,
            currency: body.currency,
            bookingId: body.bookingId,
            bookingType: body.bookingType,
            customerId: body.customerId,
            paymentMethodId: body.paymentMethodId,
            status: TransactionPaymentStatus.INITIATED,
        });
    }

    private async createStripePaymentIntent(amount: number, currency: string, key: string, metadata: any, captureMethod: 'automatic' | 'manual' = 'automatic') {
        this.logger.log(`Creating Stripe PaymentIntent`);
        return await this.stripeService.createPaymentIntent(
            amount * 100, // Stripe expects cents
            currency,
            key,
            metadata,
            captureMethod
        );
    }

    private async saveTransactionDetails(transactionId: number, paymentIntent: any) {
        await this.transactionService.addTransactionDetail({
            transactionId,
            provider: PaymentProvider.STRIPE,
            action: PaymentAction.CREATE_PAYMENT_INTENT,
            responsePayload: paymentIntent,
            success: true,
        });
    }

    private async saveIdempotencyKey(key: string, transactionId: number) {
        await this.idempotencyKeyRepository.save({
            key,
            action: PaymentAction.CREATE_PAYMENT_INTENT,
            transactionId,
        });
    }

    @Transactional()
    async capturePayment(body: CaptureStripePaymentDto): Promise<any> {
        const { transactionId, amount } = body;
        this.logger.log(`Capturing payment for transaction ${transactionId}`);

        // 1. Get the transaction
        const transaction = await this.transactionService.getOneTransactionOrFailBy({ transactionId, relations: ['details' as any] });

        console.log(transaction);

        // 2. Find the PaymentIntent ID from previous transaction details
        const detail = transaction.details?.find(
            (d) => d.action === PaymentAction.CREATE_PAYMENT_INTENT && d.success
        );

        if (!detail || !detail.responsePayload?.id) {
            throw new BadRequestException(`No active payment intent found for transaction ${transactionId}`);
        }

        const paymentIntentId = detail.responsePayload.id;

        try {
            // 3. Capture the payment
            // Convert amount to cents if provided, otherwise capture full amount
            const amountInCents = amount ? amount * 100 : undefined;
            const capturedIntent = await this.stripeService.capturePayment(paymentIntentId, amountInCents);

            // 4. Record the capture action
            await this.transactionService.addTransactionDetail({
                transactionId,
                provider: PaymentProvider.STRIPE,
                action: PaymentAction.CAPTURE_PAYMENT,
                responsePayload: capturedIntent,
                success: true,
            });

            this.logger.log(`Payment captured successfully for transaction ${transactionId}`);
            return capturedIntent;

        } catch (error: any) {
            this.logger.error(`Failed to capture payment for transaction ${transactionId}`, error.stack);
            throw error;
        }
    }

    @Transactional()
    async handleWebhook(req: Request): Promise<any> {
        const signature = (req.headers as any)['stripe-signature'] as string;

        // We need the raw body for signature verification.
        const rawBody = (req as any).rawBody;
        if (!rawBody) {
            this.logger.error('Raw body not available for signature verification');
            throw new BadRequestException(
                'Raw body not available for signature verification. Ensure middleware is configured correctly.',
            );
        }

        let event: Stripe.Event;
        try {
            event = await this.stripeService.constructEvent(rawBody, signature);
        } catch (err: any) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        this.logger.log(`Received Stripe webhook event: ${event.type}`);

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as any;
            const transactionId = paymentIntent.metadata.transactionId;

            if (transactionId) {
                this.logger.log(`Payment succeeded for transaction ${transactionId}`);
                await this.transactionService.updateTransaction(Number(transactionId), {
                    status: TransactionPaymentStatus.COMPLETED,
                });

                // Also save the full response in TransactionDetail
                await this.transactionService.addTransactionDetail({
                    transactionId: Number(transactionId),
                    provider: PaymentProvider.STRIPE,
                    action: PaymentAction.WEBHOOK_PAYMENT_SUCCEEDED,
                    responsePayload: paymentIntent,
                    success: true,
                });
            }
        } else if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object as any;
            const transactionId = paymentIntent.metadata.transactionId;
            if (transactionId) {
                this.logger.warn(`Payment failed for transaction ${transactionId}`);
                await this.transactionService.updateTransaction(Number(transactionId), {
                    status: TransactionPaymentStatus.FAILED,
                });
                await this.transactionService.addTransactionDetail({
                    transactionId: Number(transactionId),
                    provider: PaymentProvider.STRIPE,
                    action: PaymentAction.WEBHOOK_PAYMENT_FAILED,
                    responsePayload: paymentIntent,
                    success: false,
                });
            }
        }

        return { received: true };
    }

    /**
     * Placeholder for server-side price validation.
     * TODO: Implement this once the Booking entity/ID mismatch is resolved.
     */
    private async fetchBookingDetails(bookingId: number, bookingType: BookingType): Promise<{ amount: number; currency: string }> {
        // Logic to fetch booking from FlightsService or HotelsService
        // const booking = await this.flightsService.getBooking(bookingId);
        // return { amount: booking.price, currency: booking.currency };

        this.logger.warn(`Skipping server-side price validation for booking ${bookingId} due to missing implementation.`);
        return { amount: 0, currency: 'USD' }; // Dummy return
    }
}
