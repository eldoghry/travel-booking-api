import { ProcessBookingOnProvider } from './handler/process-booking/process-booking-flight-on-provider.handler';
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
import { GetFlightSummaryHandler } from './handler/create-booking/get-flight-summary.handler';
import { CreateBookingRecordHandler } from './handler/create-booking/create-booking.handler';
import { CreatePaymentLinkIntentHandler } from './handler/create-booking/create-payment-intent.handler';
import { CreateBookingContext, ProcessBookingOnProviderContext } from './handler/handler.interface';
import { NotifyUserWithNewBooking } from './handler/create-booking/notify-new-booking.handler';
import { FlightBookingStatusLog } from './entities/flight-booking-status.entity';
import { Transactional } from 'typeorm-transactional';
import { Booking, BookingRelations } from './entities/booking.entity';
import { canTransition } from './utils/status-transitions';
import { ConfirmFlightAvailabilityHandler } from './handler/create-booking/confirm-flight-availability.handler';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { ProcessBookingDto } from './dto/process-booking.dto';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { NotifyUserWithBookingStatus } from './handler/process-booking/notify-user-with-booking-status.handler';
import { UpdateBookingStatusHandler } from './handler/process-booking/update-booking-status.handler';

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
    private readonly rabbitMQ: RabbitMQService,
  ) {}

  @Transactional()
  async createBooking(dto: FlightBookingRequestDto, user: AuthenticatedUser) {
    const context: CreateBookingContext = {
      bookingRequestDto: dto,
      user,
    };

    // const handler = new ConfirmFlightAvailabilityHandler(this.flightService);

    // handler
    //   .setNext(new GetFlightSummaryHandler(this.flightService))
    //   .setNext(
    //     new CreateBookingRecordHandler(
    //       this.flightBookingRepository,
    //       this.bookingStatusLogRepository,
    //     ),
    //   )
    //   .setNext(new CreatePaymentLinkIntentHandler(this.paymentService))
    //   .setNext(new NotifyUserWithNewBooking(this.eventEmitter));

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

    const result = await handler.handle(context);

    return {
      bookingReference: result.savedBooking?.referenceNumber,
      paymentIntentLink: result.paymentIntentLink,
    };
  }

  async processBooking(dto: ProcessBookingDto) {
    await this.rabbitMQ.publish('booking', 'booking.confirm', dto);
  }

  async confirmBooking(dto: ProcessBookingDto) {
    // 0) get booking & user record.
    // 1) complete book on amaedues
    // 2) if success => notify user with success
    // 3) if fail => send refund request by rabbit mq
    // 4)         => notify user booking is failed and will refund you soon.
    // 5) update transaction and booking record

    const bookingDB = await this.findOneBookingByOrFail({
      bookingId: 1,
      bookingType: BookingType.Flight,
      withRelation: ['user'],
    });

    const context: ProcessBookingOnProviderContext = {
      bookingDto: dto,
      bookingStatus: 'pending',
      bookingDB,
    };

    const handler = new ProcessBookingOnProvider(this.flightService);

    handler
      .setNext(
        new UpdateBookingStatusHandler(
          this.flightBookingRepository,
          this.bookingStatusLogRepository,
        ),
      )
      .setNext(new NotifyUserWithBookingStatus(this.eventEmitter));

    const result = await handler.execute(context);

    return {
      status: result.bookingStatus,
    };
  }

  async findOneBookingByOrFail(dto: {
    userId?: number;
    bookingId?: number;
    bookingReference?: string;
    bookingType: BookingType;
    withRelation?: BookingRelations[];
  }) {
    if (!dto.bookingId && !dto.bookingReference) {
      throw new BadRequestException('bookingId or bookingReference are required');
    }

    const { userId, bookingId, bookingReference, bookingType, withRelation } = dto;

    const repository = this.getRepositoryByBookingType(bookingType).bookingRepository;

    const bookingDB = await repository?.findOne({
      where: {
        id: bookingId,
        referenceNumber: bookingReference,
        userId,
      },
      relations: withRelation,
    });

    if (!bookingDB) {
      throw new NotFoundException('Booking not found.');
    }

    return bookingDB;
  }

  // async processCancelBooking(dto: CancelBookingDto) {
  //   await this.rabbitMQ.publish('booking', 'booking.cancel', dto);
  //   return `Flight ${dto.bookingId} with be canceled soon.`;
  // }

  cancelBooking(dto: CancelBookingDto) {
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
