import { PaymentMethod } from 'src/modules/payment/entities/payment-method.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BookingType } from '../enums/booking-type.enum';
import { BookingStatus } from '../enums/booking-status.enum';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  referenceNumber: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'enum', enum: BookingType })
  type: BookingType; // FLIGHT or HOTEL

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // custom data (roomType, seatNumbers, dates...)

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount: number;

  @ManyToOne(() => PaymentMethod, { nullable: false })
  @JoinColumn({ name: 'paymentMethodId' })
  paymentMethod: PaymentMethod;

  @Column()
  paymentMethodId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
