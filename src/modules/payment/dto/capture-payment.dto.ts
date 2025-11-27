import { IsNotEmpty, IsString } from "class-validator";

export class CapturePaymentDto {
    @IsString()
    @IsNotEmpty()
    orderId!: string;  
}
