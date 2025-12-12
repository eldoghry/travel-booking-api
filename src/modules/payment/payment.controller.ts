import { Body, Controller, Logger, Post, Req } from "@nestjs/common";
import { PaymentService } from "./services/payment.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { Public } from "nest-keycloak-connect";
import { PayPalEventType } from "./enums/paypal.enum";
import { PayPalWebhookEvent } from "./interfaces/paypal.interface";
import { PaymentProvider } from "./enums/payment-methods.enum";

@Public()
@Controller("payments")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }
    private readonly logger = new Logger(PaymentController.name);

    @Post('process')
    async initiatePayment(@Body() body: CreatePaymentDto) {
        return this.paymentService.initiatePayment(body);
    }

    @Post('webhooks/paypal')
    async handlePayPalWebhooks(@Req() req: Request & { body: PayPalWebhookEvent }) {
        const event = req.body
        const eventType = event?.event_type as PayPalEventType
        if (!Object.values(PayPalEventType).includes(eventType)) {
            this.logger.log(`Received PayPal unhandled webhook event: ${eventType}`);
        } else {
            return this.paymentService.handleWebhook(req, PaymentProvider.PAYPAL);
        }
    }

    @Post('webhooks/stripe')
    async handleStripeWebhooks(@Req() req: Request) {
        return this.paymentService.handleWebhook(req, PaymentProvider.STRIPE);
    }
}
