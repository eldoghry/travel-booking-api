import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Transaction, TransactionRelations } from "./entities/transaction.entity";
import { TransactionStatusLog } from "./entities/transaction-status_log.entity";
import { TransactionDetail } from "./entities/transaction-detail.entity";

export type TransactionFilter = {
    transactionId?: number;
    orderId?: string;
    customerId?: number;
    bookingId?: number;
    relations?: TransactionRelations[];
};

@Injectable()
export class TransactionRepository {
    constructor(
        @InjectRepository(Transaction)
        private readonly transactionRepository: Repository<Transaction>,
        @InjectRepository(TransactionStatusLog)
        private readonly transactionStatusLogRepository: Repository<TransactionStatusLog>,
        @InjectRepository(TransactionDetail)
        private readonly transactionDetailRepository: Repository<TransactionDetail>,
    ) { }

    async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
        const transaction = this.transactionRepository.create(data);
        return await this.transactionRepository.save(transaction);
    }

    async updateTransaction(transactionId: number, data: Partial<Transaction>): Promise<Transaction | null> {
        await this.transactionRepository.update(transactionId, data);
        return await this.getTransactionBy({ transactionId });
    }

    async getTransactionBy(filter: TransactionFilter): Promise<Transaction | null> {
        const { relations, ...whereOptions } = filter;
        return await this.transactionRepository.findOne({
            where: whereOptions,
            relations: relations || []
        });
    }

    async createTransactionStatusLog(data: Partial<TransactionStatusLog>): Promise<TransactionStatusLog> {
        const transactionStatusLog = this.transactionStatusLogRepository.create(data);
        return await this.transactionStatusLogRepository.save(transactionStatusLog);
    }

    async createTransactionDetail(data: Partial<TransactionDetail>): Promise<TransactionDetail> {
        const transactionDetail = this.transactionDetailRepository.create(data);
        return await this.transactionDetailRepository.save(transactionDetail);
    }
}
