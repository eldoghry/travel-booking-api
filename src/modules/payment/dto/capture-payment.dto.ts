import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { PaymentProvider } from "../enums/payment-methods.enum";

export class CapturePaymentDto {
    @IsEnum(PaymentProvider)
    provider!: PaymentProvider;

    @IsString()
    @IsNotEmpty()
    orderId!: string;  
}
