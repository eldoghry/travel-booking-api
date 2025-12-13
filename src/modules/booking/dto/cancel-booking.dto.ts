import { IsEnum, IsNumber } from 'class-validator';
import { BookingType } from 'src/modules/transaction/enums/transaction.enum';

export class CancelBookingDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  bookingId: number;

  @IsEnum(BookingType)
  bookingType: BookingType;
}
