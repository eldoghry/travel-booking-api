import { Injectable } from "@nestjs/common";
import { CreatePaymentDto } from "../dto/create-payment.dto";
import { CapturePaymentDto } from "../dto/capture-payment.dto";
import { PaymentFactory } from "../payment.factory";

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentFactory: PaymentFactory,
    ) { } 

    async initiatePayment(body: CreatePaymentDto): Promise<any> {
        const strategy = this.paymentFactory.getStrategy(body.provider);
        return strategy.initiatePayment(body);
    }

    async capturePayment(body: CapturePaymentDto): Promise<any> {
        const strategy = this.paymentFactory.getStrategy(body.provider);
        return strategy.capturePayment(body);
    }

    async handleWebhook(req: Request, provider: string): Promise<any> {
        const strategy = this.paymentFactory.getStrategy(provider);
        return strategy.handleWebhook(req);
    }
}
