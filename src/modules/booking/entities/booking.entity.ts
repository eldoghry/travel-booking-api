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
  Index,
  TableInheritance,
  ChildEntity,
} from 'typeorm';
import { BookingType } from '../enums/booking-type.enum';
import { BookingStatus } from '../enums/booking-status.enum';

export const BOOKING_ENTITY = 'booking';

@Entity(BOOKING_ENTITY)
@TableInheritance({ column: { type: 'enum', enum: BookingType, name: 'type' } })
export abstract class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  referenceNumber: string;

  @ManyToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  userId: number;

  // @Column({ type: 'enum', enum: BookingType, nullable: false })
  // type: BookingType; // FLIGHT or HOTEL

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  // @ManyToOne(() => PaymentMethod, { nullable: true })
  // @JoinColumn({ name: 'paymentMethodId' })
  // paymentMethod: PaymentMethod;

  // @Column({ type: 'uuid', nullable: true })
  // paymentMethodId: string;

  // @Column({ type: 'varchar', length: 50, nullable: true })
  // externalBookingId: string; // External system booking reference

  // @Column({ type: 'jsonb', nullable: true })
  // metadata: any; // For any additional data that doesn't fit the schema

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'uuid', nullable: true })
  cancelledBy: string; // User ID who cancelled the booking

  // Abstract methods to be implemented by child classes
  //   abstract getBookingDetails(): any;
  //   abstract getTotalAmount(): number;
  //   abstract getCurrency(): string;
}
