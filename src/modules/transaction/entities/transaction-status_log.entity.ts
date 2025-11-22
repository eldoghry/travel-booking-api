import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './transaction.entity';
import { TransactionPaymentStatus } from '../enums/transaction.enum';

@Entity()
export class TransactionStatusLog {
	@PrimaryGeneratedColumn()
	transactionStatusLogId!: number;

	@Column({ nullable: false })
	transactionId!: number;

	@Column({
		type: 'enum', 
		enum: TransactionPaymentStatus,
		default: TransactionPaymentStatus.INITIATED,
		nullable: false
	})
	status!: TransactionPaymentStatus;

	@CreateDateColumn()
	createdAt!: Date;

	/* Relations */
	@ManyToOne(() => Transaction, (transaction) => transaction.transactionStatusLogs)
	@JoinColumn({ name: 'transaction_id' })
	transaction!: Transaction;
}
