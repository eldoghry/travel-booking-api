import { PaymentStrategy } from "../interfaces/payment-strategy.interface";
import { TransactionService } from "src/modules/transaction/transaction.service";
import { TransactionPaymentStatus } from "src/modules/transaction/enums/transaction.enum";
import { PayPalService } from "../services/paypal.service";
import { CreatePaymentDto } from "../dto/create-payment.dto";
import { BadRequestException, Logger, Injectable } from "@nestjs/common";
import { PayPalWebhookEvent } from "../interfaces/paypal.interface";
import { PaymentWebhookEventAuditData } from "src/modules/audit/interfaces/payment-audit-data.interface";
import { AuditEventType } from "src/modules/audit/enums/audit-event.enum";

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

    async handleWebhook(req: Request & { body: PayPalWebhookEvent }) {
        try {
            await this.paypalService.verifyWebhookSignature(req);

            const event = req.body;
            const type = event?.event_type;
            const resource = event?.resource;

            await this.paypalService.handleAuditPayment({
                auditEventType: AuditEventType[`PROVIDER_${type.replace(/\./g, "_")}`] ?? AuditEventType.PROVIDER_UNKNOWN,
                auditData: {
                    payload: event,
                    metadata: {
                        provider: "PayPal"
                    } as PaymentWebhookEventAuditData['metadata']
                } as PaymentWebhookEventAuditData
            })

            switch (type) {
                // User approved order → you should capture it
                case "CHECKOUT.ORDER.APPROVED":
                    const orderId = resource?.id;
                    await this.paypalService.handleApprovalPayment(orderId);
                    await this.paypalService.handleCapturePayment({ orderId });
                    break;
                // Capture completed → final successful payment
                case "PAYMENT.CAPTURE.COMPLETED":
                    await this.paypalService.handlePaymentCompleted(resource);
                    break;
                // Capture denied → payment failed
                case "PAYMENT.CAPTURE.DENIED":
                case "PAYMENT.CAPTURE.DECLINED":
                    await this.paypalService.handlePaymentFailed(resource);
                    break;

                default:
                    this.logger.log(`Unhandled webhook type: ${type}`);
            }

            return {
                status: "OK" // Always respond 200 to PayPal (to avoid paypal retrying)
            }
        } catch (err) {
            this.logger.error("Error in webhook", err);
            
            return { status: "ignored_error" };
        }
    }

}
