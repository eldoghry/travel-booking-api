import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TransactionService } from "./transaction.service";
import { TransactionRepository } from "./transaction.repository";
import { Transaction } from "./entities/transaction.entity";
import { TransactionStatusLog } from "./entities/transaction-status_log.entity";
import { TransactionDetail } from "./entities/transaction-detail.entity";
import { AuditModule } from "../audit/audit.module";

@Module({
    imports: [AuditModule, TypeOrmModule.forFeature([Transaction, TransactionStatusLog, TransactionDetail])],
    providers: [TransactionService, TransactionRepository],
    exports: [TransactionService, TransactionRepository],
})

export class TransactionModule {
    constructor() { }
}
