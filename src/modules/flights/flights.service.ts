import { Injectable } from '@nestjs/common';
import { FlightProviderManager } from './providers/flight-provider.manager';
import { FlightSearchDto, FlightSearchResponseDto } from './dto/flight-search.dto';
import { FlightBookingDto, FlightBookingResponseDto } from './dto/flight-book.dto';
import { FlightDetailsDto, FlightDetailsResponseDto } from './dto/flight-details.dto';

@Injectable()
export class FlightsService {
  constructor(private readonly flightProviderManager: FlightProviderManager) {}

  // TODO: define dtos request & response
  async searchFlights(dto: FlightSearchDto): Promise<FlightSearchResponseDto> {
    const provider = await this.flightProviderManager.getProvider();
    return provider.searchFlights(dto);
  }

  // TODO: define dtos request & response
  async getFlightDetails(dto: FlightDetailsDto): Promise<FlightDetailsResponseDto> {
    const provider = await this.flightProviderManager.getProvider();
    return provider.getFlightDetails(dto as any);
  }

  // TODO: define dtos request & response
  async bookFlight(dto: FlightBookingDto): Promise<FlightBookingResponseDto> {
    const provider = await this.flightProviderManager.getProvider();
    return provider.bookFlight(dto);
  }
}
