import { Body, Controller, Headers, Post, Query, Req } from "@nestjs/common";
import { PaymentService } from "./services/payment.service";
import { CapturePaymentDto } from "./dto/capture-payment.dto";
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

    @Post('webhook')
    async handleWebhook(@Req() req: Request, @Query('provider') provider: string) {
            return this.paymentService.handleWebhook(req, provider);
    }
}
