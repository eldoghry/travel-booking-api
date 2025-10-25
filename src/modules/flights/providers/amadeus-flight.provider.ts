import { FlightProvider } from '../interfaces/flight-provider.interface';
import { FlightSearchDto } from '../dto/flight-search.dto';
import { AmadeusAxiosService } from 'src/common/amadeus/amadeus-axios.service';
import { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { AmadeusEndpoints } from 'src/common/amadeus/amadeus-request';
import { formatDateToYMD } from 'src/common/utils/helper';

@Injectable()
export class AmadeusFlightProvider implements FlightProvider {
  private readonly axios: AxiosInstance;
  providerName: string;

  constructor(private readonly amadeusAxiosService: AmadeusAxiosService) {
    this.axios = this.amadeusAxiosService.axiosInstance;
    this.providerName = 'amadeus';
  }

  async searchFlights(criteria: FlightSearchDto): Promise<any> {
    const data = await this.axios.get(AmadeusEndpoints.FLIGHT_SEARCH, {
      params: {
        originLocationCode: criteria.origin,
        destinationLocationCode: criteria.destination,
        departureDate: formatDateToYMD(criteria.departureDate),
        returnDate: criteria?.returnDate ? formatDateToYMD(criteria.returnDate) : undefined,
        adults: criteria.adults || 1,
      },
    });

    return data;
  }

  async getFlightDetails(flightOffer: any): Promise<any> {
    const data = await this.axios.post(AmadeusEndpoints.FLIGHT_OFFER_PRICE, {
      data: {
        type: 'flight-offers-pricing',
        flightOffers: [flightOffer],
      },
    });

    return data;
  }

  async bookFlight(data: any): Promise<any> {
    throw new Error('[AmadeusFlightProvider] Method not implemented.');
  }
}
