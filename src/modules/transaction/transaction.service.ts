import { HttpException, Injectable } from '@nestjs/common';
import { TransactionFilter, TransactionRepository } from './transaction.repository';
import { Transaction } from './entities/transaction.entity';
import { TransactionDetail } from './entities/transaction-detail.entity';
import { TransactionStatusLog } from './entities/transaction-status_log.entity';
import { TransactionPaymentStatus } from './enums/transaction.enum';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class TransactionService {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async getOneTransactionOrFailBy(filter: TransactionFilter) {
    const transaction = await this.transactionRepository.getTransactionBy(filter);
    if (!transaction) {
      throw new HttpException(`Transaction not found`, 404);
    }
    return transaction;
  }

  @Transactional()
  async addTransactionStatusLog(
    data: Partial<TransactionStatusLog>,
  ): Promise<TransactionStatusLog> {
    return await this.transactionRepository.createTransactionStatusLog(data);
  }

  @Transactional()
  async addTransactionDetail(data: Partial<TransactionDetail>): Promise<TransactionDetail> {
    return await this.transactionRepository.createTransactionDetail(data);
  }

  @Transactional()
  async addNewTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    const transaction = await this.transactionRepository.createTransaction({
      ...dto,
      transactionReference: dto.transactionReference ?? crypto.randomUUID(),
      status: dto.status ?? TransactionPaymentStatus.INITIATED,
    });

    await this.addTransactionStatusLog({
      transactionId: transaction.transactionId,
      status: dto.status ?? TransactionPaymentStatus.INITIATED,
    });

    return transaction;
  }

  @Transactional()
  async updateTransaction(
    transactionId: number,
    data: Partial<Transaction>,
  ): Promise<Transaction | null> {
    const transaction = await this.transactionRepository.updateTransaction(transactionId, data);

    await this.addTransactionStatusLog({
      transactionId: transaction?.transactionId,
      status: data.status,
    });

    return transaction;
  }
}
