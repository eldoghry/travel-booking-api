import { HttpException, Injectable } from "@nestjs/common";
import { TransactionFilter, TransactionRepository } from "./transaction.repository";
import { Transaction } from "./entities/transaction.entity";
import { TransactionDetail } from "./entities/transaction-detail.entity";
import { TransactionStatusLog } from "./entities/transaction-status_log.entity";
import { TransactionPaymentStatus } from "./enums/transaction.enum";
import { Transactional } from "typeorm-transactional";
import { AuditPublisher } from "../audit/audit.publisher";
import { Audit } from "../audit/entities/audit.entity";
import { PaymentTransactionAuditData, PaymentTransactionDetailsAuditData, TransactionDetailKeys, TransactionKeys } from "../audit/interfaces/payment-audit-data.interface";
import { AuditEventType } from "../audit/enums/audit-event.enum";

@Injectable()
export class TransactionService {
    constructor(
        private readonly transactionRepository: TransactionRepository,
        private readonly auditPublisher: AuditPublisher
    ) { }

    async getOneTransactionOrFailBy(filter: TransactionFilter) {
        const transaction = await this.transactionRepository.getTransactionBy(filter);
        if (!transaction) {
            throw new HttpException(`Transaction not found`, 404);
        }
        return transaction;
    }

    private async handleAuditTransaction(data: Partial<Audit> & {
        auditData: PaymentTransactionAuditData<TransactionKeys> |
        PaymentTransactionDetailsAuditData<TransactionDetailKeys>;
    }) {
        await this.auditPublisher.publishAudit(data);
    }

    @Transactional()
    async addTransactionStatusLog(data: Partial<TransactionStatusLog>): Promise<TransactionStatusLog> {
        const transactionStatusLog = await this.transactionRepository.createTransactionStatusLog(data);
        return transactionStatusLog;
    }

    @Transactional()
    async addTransactionDetail(data: Partial<TransactionDetail>): Promise<TransactionDetail> {
        const transactionDetail = await this.transactionRepository.createTransactionDetail(data);
        await this.handleAuditTransaction({
            auditEventType: AuditEventType.PAYMENT_TRANSACTION_DETAILS_ADDED,
            auditData: {
                before: null,
                after: data,
                metadata: {
                    table: "transactionDetail",
                    transactionDetailId: transactionDetail.transactionDetailId,
                    provider: "PayPal",
                    operation: "create",
                    operationDate: transactionDetail.createdAt
                }
            } as PaymentTransactionDetailsAuditData<TransactionDetailKeys>
        })
        return transactionDetail;
    }

    @Transactional()
    async addNewTransaction(data: Partial<Transaction>): Promise<Transaction> {
        const transaction = await this.transactionRepository.createTransaction({
            ...data,
            transactionReference: data.transactionReference ?? crypto.randomUUID(),
            status: data.status ?? TransactionPaymentStatus.INITIATED
        });

        await this.handleAuditTransaction({
            auditEventType: AuditEventType.PAYMENT_TRANSACTION_INITIATED,
            auditData: {
                before: null,
                after: data,
                metadata: {
                    table: "transaction",
                    transactionId: transaction.transactionId,
                    provider: "PayPal",
                    operation: "create",
                    operationDate: transaction.createdAt
                }
            } as PaymentTransactionAuditData<TransactionKeys>
        })

        await this.addTransactionStatusLog({
            transactionId: transaction.transactionId,
            status: data.status ?? TransactionPaymentStatus.INITIATED
        });

    return transaction;
  }

    @Transactional()
    async updateTransaction(transactionId: number, data: Partial<Transaction>): Promise<Transaction | null> {
        const transaction = await this.transactionRepository.updateTransaction(transactionId, data);

        const auditEventType = transaction?.status ==='CREATED' ? AuditEventType.PAYMENT_TRANSACTION_CREATED : AuditEventType.PAYMENT_TRANSACTION_UPDATED
        await this.handleAuditTransaction({
            auditEventType: auditEventType,
            auditData: {
                before: data,
                after: data,
                metadata: {
                    table: "transaction",
                    transactionId: transaction?.transactionId,
                    provider: "PayPal",
                    operation: "update",
                    operationDate: transaction?.updatedAt
                }
            } as PaymentTransactionAuditData<TransactionKeys>
        })

    await this.addTransactionStatusLog({
      transactionId: transaction?.transactionId,
      status: data.status,
    });

    return transaction;
  }
}
