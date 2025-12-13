import { AuthenticatedUser } from 'src/common/interfaces/auth-user.interface';
import { ICommandContext } from '../../../common/abstract/command-handler.abstract';
import { FlightBookingRequestDto } from '../dto/create-booking.dto';
import { FlightBooking } from '../entities/flight-booking.entity';
import { ProcessBookingDto } from '../dto/process-booking.dto';
import { FlightBookingResponseDto } from 'src/modules/flights/dto/flight-book.dto';
import { User } from 'src/modules/users/entities/user.entity';

export interface CreateBookingContext extends ICommandContext {
  bookingRequestDto: FlightBookingRequestDto;
  user: AuthenticatedUser;
  flightSummary?: Record<string, any>;
  savedBooking?: FlightBooking;
  paymentIntentLink?: string;
}

export interface ProcessBookingOnProviderContext extends ICommandContext {
  bookingDto: ProcessBookingDto;
  bookingStatus: 'success' | 'failed' | 'pending';
  bookingDB: FlightBooking;
  bookingProviderResult?: FlightBookingResponseDto;
  bookingProviderError?: any;
}
