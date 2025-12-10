import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Unique } from 'typeorm';
import { PaymentMethodConfig } from './payment-method-config.entity';
import { Transaction } from '../../transaction/entities/transaction.entity';
import { PaymentMethodStatus } from '../enums/payment-methods.enum';

@Entity()
export class PaymentMethod {
	@PrimaryGeneratedColumn()
	paymentMethodId!: number;

	@Column({ type: 'varchar', length: 100, nullable: false })
	name!: string;

	@Column({ type: 'varchar', length: 100, nullable: false })
	description!: string;

	@Column({ type: 'varchar', length: 255, default: '' })
	iconUrl!: string;

	@Column({ type: 'integer', default: 0, nullable: false })
	order!: number; // order of payment method in the list

	@Column({ enum: PaymentMethodStatus, default: PaymentMethodStatus.INACTIVE, nullable: false })
	status!: PaymentMethodStatus;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@OneToMany(() => Transaction, (transaction) => transaction.paymentMethod)
	transactions!: Transaction[];

	@OneToMany(() => PaymentMethodConfig, (config) => config.paymentMethod)
	configs!: PaymentMethodConfig[];
}
