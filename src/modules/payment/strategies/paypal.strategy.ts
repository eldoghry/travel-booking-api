import { PaymentStrategy } from "../interfaces/payment-strategy.interface";
import { TransactionService } from "src/modules/transaction/transaction.service";
import { TransactionPaymentStatus } from "src/modules/transaction/enums/transaction.enum";
import { PayPalService } from "../services/paypal.service";
import { CreatePaymentDto } from "../dto/create-payment.dto";
import { CapturePaymentDto } from "../dto/capture-payment.dto";
import { BadRequestException, Logger } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
@Injectable()
export class PayPalStrategy implements PaymentStrategy {
    constructor(
        private readonly paypalService: PayPalService,
        private readonly transactionService: TransactionService,
    ) { }

    private readonly logger = new Logger(PayPalStrategy.name);
    
    async initiatePayment(body: CreatePaymentDto) {
        const { amount, currency, customerId, bookingType, bookingId, paymentMethodId, provider } = body;

        const transaction = await this.transactionService.addNewTransaction({
            customerId,
            bookingType,
            bookingId,
            paymentMethodId,
            amount,
            currency,
            provider,
            status: TransactionPaymentStatus.INITIATED
        });

        try {
            const order = await this.paypalService.createOrder(amount, currency);

            await this.transactionService.addTransactionDetail({
                transactionId: transaction.transactionId,
                provider: "paypal",
                action: "create_order",
                requestPayload: { amount, currency, customerId, bookingType, bookingId, paymentMethodId },
                responsePayload: order,
                success: true
            });

            await this.transactionService.updateTransaction(transaction.transactionId!, {
                orderId: order.id,
                status: TransactionPaymentStatus.CREATED
            });

            this.logger.log("PayPal initiate payment successfully");

            return {
                orderId: order.id,
                approvalUrl: order.links.find((l) => l.rel === "approve")?.href
            };


        } catch (error) {

            console.log('error in intiate payment : ', error);
            await this.transactionService.addTransactionDetail({
                transactionId: transaction.transactionId,
                provider: "paypal",
                action: "create_order",
                requestPayload: { amount, currency, customerId, bookingType, bookingId, paymentMethodId },
                responsePayload: error?.response?.data || null,
                success: false,
                errorStack: {
                    message: error.message,
                    stack: error.stack,
                    details: error.response?.data
                }
            });

            await this.transactionService.updateTransaction(transaction.transactionId!, {
                status: TransactionPaymentStatus.FAILED
            });

            this.logger.error("Failed to create PayPal order", error);
            throw new BadRequestException("Failed to create PayPal order");
        }
    }


    async capturePayment(body: CapturePaymentDto) {
        const { orderId } = body;
        const transaction = await this.transactionService.getOneTransactionOrFailBy({ orderId });


        try {
            const capture = await this.paypalService.captureOrder(orderId);

            await this.transactionService.addTransactionDetail({
                transactionId: transaction.transactionId,
                provider: "paypal",
                action: "capture_order",
                requestPayload: { orderId },
                responsePayload: capture,
                success: true,
            });

            await this.transactionService.updateTransaction(transaction.transactionId, {
                transactionReference: capture.purchase_units[0]?.reference_id,
                paymentReference: capture.purchase_units[0]?.payments?.captures[0]?.id,
                status: TransactionPaymentStatus.CAPTURED
            });

            this.logger.log("PayPal capture payment successfully", capture);

            return capture;

        } catch (error) {
            await this.transactionService.addTransactionDetail({
                transactionId: transaction.transactionId,
                provider: "paypal",
                action: "capture_order",
                requestPayload: { orderId },
                responsePayload: error?.response?.data || null,
                success: false,
                errorStack: {
                    message: error.message,
                    stack: error.stack,
                    details: error?.response?.data,
                },
            });

            await this.transactionService.updateTransaction(transaction.transactionId, {
                status: TransactionPaymentStatus.FAILED
            });

            this.logger.error("Failed to capture PayPal order", error);
            throw new BadRequestException("Capture payment failed");
        }
    }


    async handleWebhook(req: Request) {
        const event = await this.paypalService.verifyWebhookSignature(req);
        await this.paypalService.handleWebhookEvent(event);
    }

}
