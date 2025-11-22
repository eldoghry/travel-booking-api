import { CreatePaymentDto } from '../dto/create-payment.dto';

export interface PaymentStrategy {
  initiatePayment(body: CreatePaymentDto): Promise<any>;
  capturePayment(body: any): Promise<any>;
  handleWebhook(req: Request): Promise<any>;
}
