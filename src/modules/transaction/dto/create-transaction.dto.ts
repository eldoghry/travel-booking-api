import { IsEnum, IsNotEmpty, IsNumber, IsString, IsOptional } from "class-validator";
import { PaymentProvider } from "src/modules/payment/enums/payment-methods.enum";
import { TransactionPaymentStatus } from "../enums/transaction.enum";
import { BookingType } from "../enums/transaction.enum";

export class CreateTransactionDto {
    @IsNumber()
    @IsNotEmpty()
    amount!: number;

    @IsString()
    @IsNotEmpty()
    currency!: string;

    @IsEnum(PaymentProvider)
    provider!: PaymentProvider  ;

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

    @IsString()
    @IsOptional()
    orderId?: string;

    @IsString()
    @IsOptional()
    paymentReference?: string;

    @IsString()
    @IsOptional()
    transactionReference?: string;

    @IsEnum(TransactionPaymentStatus)
    @IsNotEmpty()
    status!: TransactionPaymentStatus;
}