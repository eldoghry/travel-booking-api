import { Injectable } from '@nestjs/common';
import { FlightBookingRequestDto } from './dto/create-booking.dto';

import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentService } from '../payment/services/payment.service';
import { FlightBooking } from './entities/flight-booking.entity';
import { AuthenticatedUser } from 'src/common/interfaces/auth-user.interface';
import { BookingStatus } from './enums/booking-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingType } from '../transaction/enums/transaction.enum';
import { FlightsService } from '../flights/flights.service';
import { GetFlightSummaryHandler } from './handler/get-flight-summary.handler';
import { CreateBookingRecordHandler } from './handler/create-booking.handler';
import { CreatePaymentLinkIntentHandler } from './handler/create-payment-intent.handler';
import { CreateBookingContext } from './handler/handler.interface';
import { NotifyUserWithNewBooking } from './handler/notify-new-booking.handler';

@Injectable()
export class BookingService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2, // to send notifications
    private readonly paymentService: PaymentService,
    @InjectRepository(FlightBooking)
    private readonly flightBookingRepository: Repository<FlightBooking>,
    private readonly flightService: FlightsService,
  ) {}

  async createBooking(dto: FlightBookingRequestDto, user: AuthenticatedUser) {
    // TODO: Implement logic
    //1) validate flight availability
    const handler = new GetFlightSummaryHandler(this.flightService);

    handler
      .setNext(new CreateBookingRecordHandler(this.flightBookingRepository))
      .setNext(new CreatePaymentLinkIntentHandler(this.paymentService))
      .setNext(new NotifyUserWithNewBooking(this.eventEmitter));

    const context: CreateBookingContext = {
      bookingRequestDto: dto,
      user,
    };

    const result = await handler.handle(context);

    return {
      bookingReference: result.savedBooking?.referenceNumber,
      paymentIntentLink: result.paymentIntentLink,
    };
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
}
