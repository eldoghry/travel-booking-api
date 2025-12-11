import { Flight } from './../../flights/entities/flight.entity';
import { generateReferenceNumber } from 'src/common/utils/helper';
import { CommandHandler } from '../../../common/abstract/command-handler.abstract';
import { FlightBooking } from '../entities/flight-booking.entity';
import { CreateBookingContext } from './handler.interface';
import { BookingType } from 'src/modules/transaction/enums/transaction.enum';
import { BookingStatus } from '../enums/booking-status.enum';
import { Repository } from 'typeorm';

export class CreateBookingRecordHandler extends CommandHandler<CreateBookingContext> {
  constructor(private readonly flightBookingRepository: Repository<FlightBooking>) {
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

    context.savedBooking = savedBooking;

    // console.log('CreateBookingRecordHandler', context);
    console.log('2) CreateBookingRecordHandler');
    return context;
  }
}
