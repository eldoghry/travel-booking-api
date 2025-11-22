import {
	Column,
	Entity,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
	UpdateDateColumn
} from 'typeorm';
import { PaymentMethod } from './payment-method.entity';

@Entity()
export class PaymentMethodConfig {
	@PrimaryGeneratedColumn()
	paymentMethodConfigId!: number;

	@Column({ nullable: false })
	paymentMethodId!: number;

	@Column({ type: 'jsonb', nullable: false })
	gatewayConfig!: Record<string, any>;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	/* Relations */
	@ManyToOne(() => PaymentMethod)
	@JoinColumn({ name: 'payment_method_id' })
	paymentMethod!: PaymentMethod;
}
