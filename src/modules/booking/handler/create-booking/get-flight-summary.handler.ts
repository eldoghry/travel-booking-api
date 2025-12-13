import { FlightsService } from '../../../flights/flights.service';
import { CommandHandler } from '../../../../common/abstract/command-handler.abstract';
import { CreateBookingContext } from '../handler.interface';

export class GetFlightSummaryHandler extends CommandHandler<CreateBookingContext> {
  constructor(private readonly flightService: FlightsService) {
    super();
  }

  async execute(context: CreateBookingContext): Promise<CreateBookingContext> {
    try {
      const flightSummary = await this.flightService.getFlightSearchSummary(
        context.bookingRequestDto.providerResult?.flightOffers[0],
      );

      context.flightSummary = flightSummary;
      return context;
    } catch (error) {
      console.error('Error in GetFlightSummaryHandler:', error);
      throw error;
    }
  }
}
