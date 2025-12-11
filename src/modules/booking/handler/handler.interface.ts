import { AuthenticatedUser } from 'src/common/interfaces/auth-user.interface';
import { ICommandContext } from '../../../common/abstract/command-handler.abstract';
import { FlightBookingRequestDto } from '../dto/create-booking.dto';
import { FlightBooking } from '../entities/flight-booking.entity';

export interface CreateBookingContext extends ICommandContext {
  bookingRequestDto: FlightBookingRequestDto;
  user: AuthenticatedUser;
  flightSummary?: Record<string, any>;
  savedBooking?: FlightBooking;
  paymentIntentLink?: string;
}
