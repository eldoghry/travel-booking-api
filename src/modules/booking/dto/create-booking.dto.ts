import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { BookingType } from '../enums/booking-type.enum';
import { Type } from 'class-transformer';
import { FlightBookingDto } from 'src/modules/flights/dto/flight-book.dto';
import { PaymentProvider } from 'src/modules/payment/enums/payment-methods.enum';

export class FlightBookingRequestDto extends FlightBookingDto {
  @IsEnum(PaymentProvider)
  paymentMethod: PaymentProvider;
}
