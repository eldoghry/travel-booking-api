import { Body, Controller, Post, Req } from "@nestjs/common";
import { PaymentService } from "./services/payment.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { Public } from "nest-keycloak-connect";

@Public()
@Controller("payments")
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('process')
    async initiatePayment(@Body() body: CreatePaymentDto) {
        return this.paymentService.initiatePayment(body);
    }

    @Post('webhooks/paypal')
    async handlePayPalWebhooks(@Req() req: Request) {
        return this.paymentService.handleWebhook(req, 'paypal');
    }

    @Post('webhooks/stripe')
    async handleStripeWebhooks(@Req() req: Request) {
        return this.paymentService.handleWebhook(req, 'stripe');
    }
}
