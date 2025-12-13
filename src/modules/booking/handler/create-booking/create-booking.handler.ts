import { Flight } from '../../../flights/entities/flight.entity';
import { generateReferenceNumber } from 'src/common/utils/helper';
import { CommandHandler } from '../../../../common/abstract/command-handler.abstract';
import { FlightBooking } from '../../entities/flight-booking.entity';
import { CreateBookingContext } from '../handler.interface';
import { BookingType } from 'src/modules/transaction/enums/transaction.enum';
import { BookingStatus } from '../../enums/booking-status.enum';
import { Repository } from 'typeorm';
import { FlightBookingStatusLog } from '../../entities/flight-booking-status.entity';

export class CreateBookingRecordHandler extends CommandHandler<CreateBookingContext> {
  constructor(
    private readonly flightBookingRepository: Repository<FlightBooking>,
    private readonly bookingStatusLogRepository: Repository<FlightBookingStatusLog>,
  ) {
    super();
  }

  async execute(context: CreateBookingContext): Promise<CreateBookingContext> {
    const booking = new FlightBooking();

    booking.referenceNumber = generateReferenceNumber(BookingType.Flight);
    booking.userId = context.user.id;
    booking.flightDetails = context.bookingRequestDto.providerResult;
    booking.passengers = context.bookingRequestDto.travelers;
    booking.status = BookingStatus.PENDING;

    const savedBooking = await this.flightBookingRepository.save(booking);

    const statusLog = new FlightBookingStatusLog();
    statusLog.bookingId = savedBooking.id;
    statusLog.status = savedBooking.status;
    statusLog.createdAt = savedBooking.createdAt;

    await this.bookingStatusLogRepository.save(statusLog);

    context.savedBooking = savedBooking;

    return context;
  }
}
