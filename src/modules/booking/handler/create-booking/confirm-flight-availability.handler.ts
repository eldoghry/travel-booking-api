import { FlightsService } from '../../../flights/flights.service';
import { CommandHandler } from '../../../../common/abstract/command-handler.abstract';
import { CreateBookingContext } from '../handler.interface';
import {
  FlightDetailsDto,
  FlightDetailsResponseDto,
} from 'src/modules/flights/dto/flight-details.dto';
import { BadRequestException } from '@nestjs/common';

export class ConfirmFlightAvailabilityHandler extends CommandHandler<CreateBookingContext> {
  constructor(private readonly flightService: FlightsService) {
    super();
  }

  async execute(context: CreateBookingContext): Promise<CreateBookingContext> {
    // 1) prepare payload
    const payload: FlightDetailsDto = {
      provider: context.bookingRequestDto.provider,
      flightId: context.bookingRequestDto.flightId,
      providerResult: context.bookingRequestDto.providerResult.flightOffers[0],
    };

    let flightDetails: FlightDetailsResponseDto;

    try {
      flightDetails = await this.flightService.getFlightDetails(payload);
    } catch (error) {
      console.error('Error in ConfirmFlightAvailabilityHandler:', error);
      throw error;
    }

    if (!flightDetails) throw new BadRequestException('Cannot confirm flight availability.');

    return context;
  }
}
