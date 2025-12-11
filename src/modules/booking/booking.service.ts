import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FlightBookingRequestDto } from './dto/create-booking.dto';

import { DataSource, FindOptionsSelect, Repository, Transaction } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentService } from '../payment/services/payment.service';
import { FlightBooking } from './entities/flight-booking.entity';
import type { AuthenticatedUser } from 'src/common/interfaces/auth-user.interface';
import { BookingStatus } from './enums/booking-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingType } from '../transaction/enums/transaction.enum';
import { FlightsService } from '../flights/flights.service';
import { GetFlightSummaryHandler } from './handler/get-flight-summary.handler';
import { CreateBookingRecordHandler } from './handler/create-booking.handler';
import { CreatePaymentLinkIntentHandler } from './handler/create-payment-intent.handler';
import { CreateBookingContext } from './handler/handler.interface';
import { NotifyUserWithNewBooking } from './handler/notify-new-booking.handler';
import { FlightBookingStatusLog } from './entities/flight-booking-status.entity';
import { Transactional } from 'typeorm-transactional';
import { Booking } from './entities/booking.entity';
import { canTransition } from './utils/status-transitions';

@Injectable()
export class BookingService {
  constructor(
    // private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly paymentService: PaymentService,
    @InjectRepository(FlightBooking)
    private readonly flightBookingRepository: Repository<FlightBooking>,
    @InjectRepository(FlightBookingStatusLog)
    private readonly bookingStatusLogRepository: Repository<FlightBookingStatusLog>,
    private readonly flightService: FlightsService,
  ) {}

  @Transactional()
  async createBooking(dto: FlightBookingRequestDto, user: AuthenticatedUser) {
    //1) validate flight availability
    const handler = new GetFlightSummaryHandler(this.flightService);

    handler
      .setNext(
        new CreateBookingRecordHandler(
          this.flightBookingRepository,
          this.bookingStatusLogRepository,
        ),
      )
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

  async findOneBookingByOrFail(dto: {
    userId?: number;
    bookingId?: number;
    bookingReference?: string;
    bookingType: BookingType;
  }) {
    if (!dto.bookingId && !dto.bookingReference) {
      throw new BadRequestException('bookingId or bookingReference are required');
    }

    const { userId, bookingId, bookingReference, bookingType } = dto;

    const repository = this.getRepositoryByBookingType(bookingType).bookingRepository;

    const bookingDB = await repository?.findOne({
      where: {
        id: bookingId,
        referenceNumber: bookingReference,
        userId,
      },
    });

    if (!bookingDB) {
      throw new NotFoundException('Booking not found.');
    }

    return bookingDB;
  }

  cancelBooking(dto: { userId: number; bookingId: number; bookingType: BookingType }) {
    return this.updateBookingStatus({ ...dto, bookingStatus: BookingStatus.CANCELLED });
  }

  @Transactional()
  async updateBookingStatus(dto: {
    userId?: number;
    bookingId: number;
    bookingType: BookingType;
    bookingStatus: BookingStatus;
    booking?: Booking;
  }) {
    const { bookingType } = dto;

    const { bookingRepository, bookingStatusLogRepository } =
      this.getRepositoryByBookingType(bookingType);

    const booking = dto?.booking || ((await this.findOneBookingByOrFail(dto)) as Booking);

    if (!canTransition(booking.status, dto.bookingStatus)) {
      throw new BadRequestException(
        `Invalid booking status transition: ${booking.status} -> ${dto.bookingStatus}`,
      );
    }

    if (booking.status === dto.bookingStatus) return;

    const now = new Date();

    booking.status = dto.bookingStatus;
    booking.updatedAt = now;

    const updatedBooking = await bookingRepository?.save(booking);

    const statusLog = new FlightBookingStatusLog();
    statusLog.bookingId = updatedBooking?.id as number;
    statusLog.status = dto.bookingStatus;
    statusLog.createdAt = now;

    await bookingStatusLogRepository?.save(statusLog);
  }

  getUserBookings(dto: { userId: number; bookingType: BookingType }) {
    const { bookingType, userId } = dto;

    const { bookingRepository } = this.getRepositoryByBookingType(bookingType);

    // let selectOptions: FindOptionsSelect<Booking> = {};

    // if (bookingType === BookingType.Flight) {
    //   selectOptions = {} as FindOptionsSelect<FlightBooking>;
    // }

    return bookingRepository?.find({
      where: {
        userId,
      },
      order: { createdAt: 'DESC' },
      select: {
        id: true,
        status: true,
        cancelledAt: true,
        createdAt: true,
        referenceNumber: true,
      },
    });
  }

  async getUserBookingDetails(dto: {
    bookingId: number;
    userId: number;
    bookingType: BookingType;
  }) {
    const { bookingType, userId, bookingId } = dto;

    const { bookingRepository } = this.getRepositoryByBookingType(bookingType);

    const booking = await bookingRepository?.findOne({
      where: {
        userId,
        id: bookingId,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found.');

    return booking;
  }

  private getRepositoryByBookingType(bookingType: BookingType): {
    bookingRepository: Repository<FlightBooking> | undefined;
    bookingStatusLogRepository: Repository<FlightBookingStatusLog> | undefined;
  } {
    let bookingRepository: Repository<FlightBooking> | undefined = undefined;
    let bookingStatusLogRepository: Repository<FlightBookingStatusLog> | undefined = undefined;

    if (bookingType === BookingType.Flight) {
      bookingRepository = this.flightBookingRepository;
      bookingStatusLogRepository = this.bookingStatusLogRepository;
    } else if (bookingType === BookingType.Hotel) {
      // repository = this.hotelBookingRepository;
      throw new Error('Hotel booking not implemented yet');
    }

    return { bookingRepository, bookingStatusLogRepository };
  }
}
