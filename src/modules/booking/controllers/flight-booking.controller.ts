import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FlightBookingRequestDto } from '../dto/create-booking.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import type { AuthenticatedUser } from 'src/common/interfaces/auth-user.interface';
import { Roles } from 'nest-keycloak-connect';
import { BookingService } from '../booking.service';
import { BookingType } from 'src/modules/transaction/enums/transaction.enum';

@Controller('flight/booking')
export class FlightBookingController {
  constructor(private readonly bookingService: BookingService) {}

  //   @Roles({ roles: ['user'] })
  @Post('book')
  async bookFlight(
    @Body() createFlightBookingDto: FlightBookingRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingService.createBooking(createFlightBookingDto, user);
  }

  @Get('cancel/:bookingId')
  async cancelFlightBooking(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingService.cancelBooking({
      bookingId: parseInt(bookingId),
      userId: user.id,
      bookingType: BookingType.Flight,
    });
  }

  @Get('details/:bookingId')
  async getFlightBookingDetails(
    @Param('bookingId') bookingId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingService.getUserBookingDetails({
      userId: user.id,
      bookingType: BookingType.Flight,
      bookingId: parseInt(bookingId),
    });
  }

  @Get('list')
  async listFlightBookings(@CurrentUser() user: AuthenticatedUser) {
    return this.bookingService.getUserBookings({
      userId: user.id,
      bookingType: BookingType.Flight,
    });
  }
}
