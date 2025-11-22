import { IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { PaymentProvider } from "../enums/payment-methods.enum";
import { BookingType } from "src/modules/transaction/enums/transaction.enum";

export class CreatePaymentDto {
    @IsNumber()
    @IsNotEmpty()
    amount!: number;

    @IsString()
    @IsNotEmpty()
    currency!: string;

    @IsEnum(PaymentProvider)
    provider!: PaymentProvider;

    // Transaction metadata
    @IsNumber()
    @IsNotEmpty()
    customerId!: number;

    @IsNumber()
    @IsNotEmpty()
    bookingId!: number;

    @IsEnum(BookingType)
    @IsNotEmpty()
    bookingType!: BookingType;

    @IsNumber()
    @IsNotEmpty()
    paymentMethodId!: number;
}
