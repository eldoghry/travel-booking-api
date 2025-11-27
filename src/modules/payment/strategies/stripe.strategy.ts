import { PaymentStrategy } from "../interfaces/payment-strategy.interface";
import { CreatePaymentDto } from "../dto/create-payment.dto";
import { CapturePaymentDto } from "../dto/capture-payment.dto";
import { Injectable } from "@nestjs/common";

@Injectable()
export class StripeStrategy implements PaymentStrategy {
    constructor() {}

   async initiatePayment(body: CreatePaymentDto): Promise<any> {
    }

   async capturePayment(body: CapturePaymentDto): Promise<any> {
    }

    async handleWebhook(request: Request): Promise<any> {
    }
}   