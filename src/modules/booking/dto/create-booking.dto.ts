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

export class FlightBookingMetaData {
  @IsString()
  from: string;

  @IsString()
  to: string;

  @IsDateString()
  departureDate: string;

  @IsOptional()
  @IsString()
  seatNumber?: string;
  // TODO: Add more fields as needed
}

export class HotelBookingMetaData {
  @IsString()
  hotelName: string;

  @IsDateString()
  checkIn: string;

  @IsDateString()
  checkOut: string;

  @IsString()
  roomType: string;
  // TODO: Add more fields as needed
}

export class CreateBookingDto {
  @IsUUID()
  userId: string;

  @IsEnum(BookingType)
  bookingType: BookingType;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsInt()
  @Min(1)
  paymentMethodId: number;

  // metadata validation based on booking type
  @ValidateNested()
  @Type((options) => {
    const object = options?.object as CreateBookingDto;

    if (object.bookingType === BookingType.FLIGHT) {
      return FlightBookingMetaData;
    }

    if (object.bookingType === BookingType.HOTEL) {
      return HotelBookingMetaData;
    }

    return Object; // default fallback
  })
  metadata: FlightBookingMetaData | HotelBookingMetaData;
}
