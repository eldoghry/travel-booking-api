import { Booking } from './booking.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { BookingStatus } from '../enums/booking-status.enum';
import { FlightBooking } from './flight-booking.entity';

@Entity('flight_booking_status_logs')
export class FlightBookingStatusLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => FlightBooking, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: FlightBooking;

  @Column()
  @Index()
  bookingId: number;

  @Column({ type: 'enum', enum: BookingStatus })
  status: BookingStatus;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
