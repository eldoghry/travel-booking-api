import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class BookingService {
  constructor(
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2, // to send notifications
  ) {}

  createBooking(dto: CreateBookingDto) {
    // TODO: Implement logic
  }

  processBooking() {
    // TODO: Implement logic
  }

  cancelBooking() {
    // TODO: Implement logic
  }

  getBookingById() {
    // TODO: Implement logic
  }

  getUserBookings() {
    // TODO: Implement logic
  }

  private generateReferenceNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `BOOK-${timestamp}-${random}`;
  }
}
