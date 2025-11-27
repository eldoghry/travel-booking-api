import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentFactory } from "./payment.factory";
import { StripeStrategy } from "./strategies/stripe.strategy";
import { PayPalStrategy } from "./strategies/paypal.strategy";
import { PaymentService } from "./services/payment.service";
import { PayPalService } from "./services/paypal.service";
import { StripeService } from "./services/stripe.service";
import { TransactionModule } from "../transaction/transaction.module";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentMethod } from "./entities/payment-method.entity";
import { PaymentMethodConfig } from "./entities/payment-method-config.entity";
@Module({
    imports: [TransactionModule, HttpModule, TypeOrmModule.forFeature([PaymentMethod, PaymentMethodConfig])],
    controllers: [PaymentController],
    providers: [PaymentFactory, StripeStrategy, PayPalStrategy, PaymentService, PayPalService, StripeService],
    exports: [PaymentService],
})
export class PaymentModule { }