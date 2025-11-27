import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TransactionDetail } from "./transaction-detail.entity";
import { PaymentMethod } from "src/modules/payment/entities/payment-method.entity";
import { TransactionStatusLog } from "./transaction-status_log.entity";
import { TransactionPaymentStatus } from "../enums/transaction.enum";
import { BookingType } from "../enums/transaction.enum";


export type TransactionRelations = 'transactionDetail' | 'paymentMethod' | 'transactionStatusLogs' | 'customer';

@Check(`"amount" >= 0.00`)
@Entity()
export class Transaction {

    @PrimaryGeneratedColumn()
    transactionId!: number;

    @Column({ nullable: true })
    customerId?: number;

    @Column({ nullable: false, enum: BookingType })
    bookingType!: BookingType;

    @Column({ nullable: false })
    bookingId!: number;

    @Column({ nullable: false })
    paymentMethodId!: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    orderId!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
    amount!: number;

    @Column({ nullable: false })
    currency!: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
    transactionReference!: string;

    @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
    paymentReference!: string;

    @Column({ nullable: false, enum: TransactionPaymentStatus })
    status!: TransactionPaymentStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    /* Relations */
    @OneToMany(() => TransactionDetail, (detail) => detail.transaction)
    details!: TransactionDetail[];

    // @ManyToOne(() => Customer)
    // @JoinColumn({ name: 'customer_id' })
    // customer!: Customer;

    @ManyToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.transactions)
    @JoinColumn({ name: 'payment_method_id' })
    paymentMethod!: PaymentMethod;

    @OneToMany(() => TransactionStatusLog, (transactionStatusLog) => transactionStatusLog.transaction)
    transactionStatusLogs!: TransactionStatusLog[];
}
