import { IsNotEmpty, IsNumber, IsOptional, IsPositive } from "class-validator";

export class CaptureStripePaymentDto {
    @IsNumber()
    @IsNotEmpty()
    transactionId!: number;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    amount?: number;
}
