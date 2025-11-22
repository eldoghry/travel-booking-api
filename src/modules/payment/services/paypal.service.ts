import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { TransactionPaymentStatus } from "src/modules/transaction/enums/transaction.enum";
import { HttpService } from "@nestjs/axios";
import { RedisService } from "src/common/redis/redis.service";
import { TransactionService } from "src/modules/transaction/transaction.service";

@Injectable()
export class PayPalService {
    private readonly logger = new Logger(PayPalService.name);
    private readonly baseUrl = process.env.PAYPAL_BASE_URL;

    constructor(
        private readonly httpService: HttpService,
        private readonly redisService: RedisService,
        private readonly transactionService: TransactionService
    ) { }

    private async getAccessToken(): Promise<string> {
        const cachedAccessToken = await this.redisService.get("paypal_access_token");
        if (cachedAccessToken) return cachedAccessToken as string;

        const res = await firstValueFrom(
            this.httpService.post(`${this.baseUrl}/v1/oauth2/token`,
                "grant_type=client_credentials",
                {
                    auth: {
                        username: process.env.PAYPAL_CLIENT_ID!,
                        password: process.env.PAYPAL_CLIENT_SECRET!,
                    },
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json"
                    }
                })
        );

        const accessToken = res.data.access_token;
        await this.redisService.set("paypal_access_token", accessToken, res.data.expires_in);
        return accessToken;
    }

    async createOrder(amount: number, currency: string) {
        const token = await this.getAccessToken();

        const body = {
            intent: "CAPTURE",
            purchase_units: [{
                amount: { value: amount.toString(), currency_code: currency }
            }],
            application_context: {
                return_url: `${process.env.BASE_URL}/payment/success`,
                cancel_url: `${process.env.BASE_URL}/payment/cancelled`
            }
        };

        const res = await firstValueFrom(
            this.httpService.post(`${this.baseUrl}/v2/checkout/orders`, body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
        );

        this.logger.log("PayPal create order successfully");
        return res.data;
    }

    async captureOrder(orderId: string) {
        const token = await this.getAccessToken();

        const res = await firstValueFrom(
            this.httpService.post(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
        );

        return res.data;
    }

    async verifyWebhookSignature(req: Request) {
        const token = await this.getAccessToken();

        const body = {
            auth_algo: req.headers["paypal-auth-algo"],
            cert_url: req.headers["paypal-cert-url"],
            transmission_id: req.headers["paypal-transmission-id"],
            transmission_sig: req.headers["paypal-transmission-sig"],
            transmission_time: req.headers["paypal-transmission-time"],
            webhook_id: process.env.PAYPAL_WEBHOOK_ID,
            webhook_event: req.body,
        };

        const res = await firstValueFrom(
            this.httpService.post(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, body, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            })
        );

        return res.data;

    }

    async handleWebhookEvent(event: any) {
        const type = event.event_type;
        const resource = event.resource;

        switch (type) {
            case "PAYMENT.CAPTURE.COMPLETED":
                await this.handlePaymentCompleted(resource);
                break;

            case "PAYMENT.CAPTURE.DENIED":
            case "PAYMENT.CAPTURE.DECLINED":
                await this.handlePaymentFailed(resource, type);
                break;

            default:
                this.logger.log(`Unhandled webhook type: ${type}`);
        }
    }

    private async handlePaymentCompleted(resource: any) {
        const orderId = resource.supplementary_data.related_ids.order_id;
        const transaction = await this.transactionService.getOneTransactionOrFailBy({ orderId });

        await this.transactionService.addTransactionDetail({
            transactionId: transaction.transactionId,
            provider: "paypal",
            action: "webhook_event",
            requestPayload: resource,
            success: true
        });

        await this.transactionService.updateTransaction(transaction.transactionId, {
            status: TransactionPaymentStatus.COMPLETED
        });

        this.logger.log(`Payment completed successfully for order: ${orderId}`);
    }

    private async handlePaymentFailed(resource: any, eventType: string) {
        const orderId = resource.supplementary_data.related_ids.order_id;
        const transaction = await this.transactionService.getOneTransactionOrFailBy({ orderId });

        await this.transactionService.addTransactionDetail({
            transactionId: transaction.transactionId,
            provider: "paypal",
            action: `webhook_${eventType.toLowerCase()}`,
            requestPayload: resource,
            success: false,
            errorStack: {
                message: "Payment failed",
                stack: "Payment failed",
                details: { eventType }
            }
        });

        await this.transactionService.updateTransaction(transaction.transactionId, {
            status: TransactionPaymentStatus.FAILED
        });

        this.logger.error(`Payment failed for order: ${orderId}`);
    }
}
