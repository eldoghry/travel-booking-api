import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FlightBookingRequestDto } from '../dto/create-booking.dto';
import { CurrentUser } from 'src/decorators/current-user.decorator';
import * as Auth from 'src/common/interfaces/auth-user.interface';
import { Roles } from 'nest-keycloak-connect';
import { BookingService } from '../booking.service';

@Controller('flight/booking')
export class FlightBookingController {
  constructor(private readonly bookingService: BookingService) {}

  //   @Roles({ roles: ['user'] })
  @Post('book')
  async bookFlight(
    @Body() createFlightBookingDto: FlightBookingRequestDto,
    @CurrentUser() user: Auth.AuthenticatedUser,
  ) {
    return this.bookingService.createBooking(createFlightBookingDto, user);
  }

  @Post('cancel/:id')
  async cancelFlightBooking(@Param('id') id: string) {}

  @Get('details/:id')
  async getFlightBookingDetails(@Param('id') id: string) {}

  @Get('list')
  async listFlightBookings() {}
}
