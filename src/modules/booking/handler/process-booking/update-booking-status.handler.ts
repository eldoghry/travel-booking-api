import { CommandHandler } from 'src/common/abstract/command-handler.abstract';
import { Repository } from 'typeorm';
import { ProcessBookingOnProviderContext } from '../handler.interface';
import { FlightBooking } from '../../entities/flight-booking.entity';
import { FlightBookingStatusLog } from '../../entities/flight-booking-status.entity';
import { BookingStatus } from '../../enums/booking-status.enum';

export class UpdateBookingStatusHandler extends CommandHandler<ProcessBookingOnProviderContext> {
  constructor(
    private readonly flightBookingRepository: Repository<FlightBooking>,
    private readonly bookingStatusLogRepository: Repository<FlightBookingStatusLog>,
  ) {
    super();
  }

  async execute(
    context: ProcessBookingOnProviderContext,
  ): Promise<ProcessBookingOnProviderContext> {
    if (context.bookingStatus === 'pending') return context;

    const booking = context.bookingDB;

    const newStatus =
      context.bookingStatus === 'success' ? BookingStatus.CONFIRMED : BookingStatus.FAILED;

    booking.status = newStatus;

    await this.flightBookingRepository.save(booking);

    const newStatusLog = new FlightBookingStatusLog();

    newStatusLog.bookingId = booking.id;
    newStatusLog.status = booking.status;

    await this.bookingStatusLogRepository.save(newStatusLog);

    context.bookingDB = booking;
    return context;
  }
}
