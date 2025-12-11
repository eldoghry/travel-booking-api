// src/modules/booking/entities/flight-booking.entity.ts
import { Booking } from './booking.entity';
import { ChildEntity, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BookingType } from '../enums/booking-type.enum';

// export enum PassengerType {
//   ADULT = 'ADULT',
//   CHILD = 'CHILD',
//   INFANT = 'INFANT',
// }

// export enum DocumentType {
//   PASSPORT = 'PASSPORT',
//   ID_CARD = 'ID_CARD',
//   DRIVING_LICENSE = 'DRIVING_LICENSE',
//   BIRTH_CERTIFICATE = 'BIRTH_CERTIFICATE',
// }

// export interface Passenger {
//   firstName: string;
//   lastName: string;
//   dateOfBirth: string;
//   type: PassengerType;
//   documentType: DocumentType;
//   documentNumber: string;
//   documentExpiryDate: string;
//   nationality?: string;
//   seatNumber?: string;
// }

@Entity('flight_bookings')
export class FlightBooking extends Booking {
  constructor() {
    super();
  }

  @Column({ type: 'jsonb' })
  //   flightDetails: {
  //     flightNumber: string;
  //     airline: string;
  //     departure: {
  //       airport: string;
  //       city: string;
  //       dateTime: string;
  //     };
  //     arrival: {
  //       airport: string;
  //       city: string;
  //       dateTime: string;
  //     };
  //     duration: number; // in minutes
  //     cabinClass: string;
  //   };
  flightDetails: Record<string, any>;

  @Column({ type: 'jsonb' })
  passengers: Record<string, any>[];

  // @Column({ type: 'decimal', precision: 10, scale: 2 })
  // baseFare: number;

  // @Column({ type: 'decimal', precision: 10, scale: 2 })
  // taxes: number;

  // @Column({ type: 'decimal', precision: 10, scale: 2 })
  // totalAmount: number;

  // @Column({ type: 'varchar', length: 10 })
  // currency: string;

  // @Column({ type: 'jsonb', nullable: true })
  // additionalInfo: any;

  // getBookingDetails(): any {
  //   return {
  //     ...this.flightDetails,
  //     passengers: this.passengers,
  //     baseFare: this.baseFare,
  //     taxes: this.taxes,
  //     totalAmount: this.totalAmount,
  //     currency: this.currency,
  //     ...(this.additionalInfo || {}),
  //   };
  // }

  // getTotalAmount(): number {
  //   return this.totalAmount;
  // }

  // getCurrency(): string {
  //   return this.currency;
  // }
}
