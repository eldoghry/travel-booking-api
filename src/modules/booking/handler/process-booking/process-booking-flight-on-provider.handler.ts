import { FlightsService } from '../../../flights/flights.service';
import { CommandHandler } from '../../../../common/abstract/command-handler.abstract';
import { ProcessBookingOnProviderContext } from '../handler.interface';
import {
  FlightDetailsDto,
  FlightDetailsResponseDto,
} from 'src/modules/flights/dto/flight-details.dto';
import { BadRequestException } from '@nestjs/common';
import { FlightBookingResponseDto } from 'src/modules/flights/dto/flight-book.dto';

export class ProcessBookingOnProvider extends CommandHandler<ProcessBookingOnProviderContext> {
  constructor(private readonly flightService: FlightsService) {
    super();
  }

  async execute(
    context: ProcessBookingOnProviderContext,
  ): Promise<ProcessBookingOnProviderContext> {
    let providerBookingResult: FlightBookingResponseDto;

    try {
      providerBookingResult = await this.flightService.bookFlight(context.bookingDto);
    } catch (error) {
      console.error('Error in ProcessBookingOnProvider:', error);
      context.bookingProviderError = error;
      context.bookingStatus = 'failed';
      return context;
    }

    if (providerBookingResult) {
      context.bookingStatus =
        `${providerBookingResult?.summary?.ticketingStatus}`.toUpperCase() !== 'CONFIRM'
          ? 'failed'
          : 'success';

      context.bookingProviderResult = providerBookingResult;

      console.log(
        `${providerBookingResult.summary.orderId} is ${providerBookingResult.summary.ticketingStatus}`,
      );
    }

    return context;
  }
}
