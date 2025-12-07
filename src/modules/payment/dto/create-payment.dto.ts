import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, IsISO4217CurrencyCode } from "class-validator";
import { PaymentProvider } from "../enums/payment-methods.enum";
import { BookingType } from "src/modules/transaction/enums/transaction.enum";

export class CreatePaymentDto {
    @IsNumber()
    @IsNotEmpty()
    @IsPositive()
    amount!: number;

    @IsString()
    @IsNotEmpty()
    @IsISO4217CurrencyCode()
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
