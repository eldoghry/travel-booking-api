import { FlightProvider } from '../interfaces/flight-provider.interface';
import { FlightSearchDto } from '../dto/flight-search.dto';
import { AmadeusAxiosService } from 'src/common/amadeus/amadeus-axios.service';
import { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { AmadeusEndpoints } from 'src/common/amadeus/amadeus-request';

@Injectable()
export class AmadeusFlightProvider implements FlightProvider {
  private readonly axios: AxiosInstance;

  constructor(private readonly amadeusAxiosService: AmadeusAxiosService) {
    this.axios = this.amadeusAxiosService.axiosInstance;
  }

  async searchFlights(criteria: FlightSearchDto): Promise<any> {
    const data = await this.axios.get(AmadeusEndpoints.FLIGHT_SEARCH, {
      params: {
        originLocationCode: 'CAI',
        destinationLocationCode: 'JED',
        departureDate: '2025-12-01',
        returnDate: '2025-12-31',
        adults: 1,
      },
    });

    return data;
  }

  async getFlightDetails(flightId: string): Promise<any> {
    throw new Error('[AmadeusFlightProvider] Method not implemented.');
  }

  async bookFlight(data: any): Promise<any> {
    throw new Error('[AmadeusFlightProvider] Method not implemented.');
  }
}
