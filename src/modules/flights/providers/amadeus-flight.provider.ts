import { FlightProvider } from '../interfaces/flight-provider.interface';
import { FlightSearchDto } from '../dto/flight-search.dto';
import { AmadeusAxiosService } from 'src/common/amadeus/amadeus-axios.service';
import { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { AmadeusEndpoints } from 'src/common/amadeus/amadeus-request';
import { formatDateToYMD } from 'src/common/utils/helper';
import { FlightSummary } from '../interfaces/fligth-summary.interface';

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

  async bookFlight(flightPriceOffer: any): Promise<any> {
    const { travelers, ...flightOffers } = flightPriceOffer;
    const data = await this.axios.post(AmadeusEndpoints.FLIGHT_BOOKING, {
      data: {
        type: 'flight-order',
        flightOffers: [flightOffers],
        travelers: flightPriceOffer.travelers,
      },
    });

    return data;
  }

  getFlightPriceSummary(flightPriceOfferResponse: any): FlightSummary {
    const offer = flightPriceOfferResponse?.data?.flightOffers?.[0];
    const warnings = flightPriceOfferResponse?.warnings || [];

    if (!offer) throw new Error('No flight offer found');

    const itineraries = offer.itineraries.map((itinerary: any) => {
      const firstSeg = itinerary.segments[0];
      const lastSeg = itinerary.segments[itinerary.segments.length - 1];

      return {
        from: firstSeg.departure.iataCode,
        to: lastSeg.arrival.iataCode,
        departure: firstSeg.departure.at,
        arrival: lastSeg.arrival.at,
        duration: itinerary.segments
          .map((s: any) => s.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm'))
          .join(' + '),
        segments: itinerary.segments.length,
      };
    });

    const travelerPricing = offer.travelerPricings?.[0];
    const cabinClass = travelerPricing?.fareDetailsBySegment?.[0]?.cabin || 'UNKNOWN';
    const baggage = travelerPricing?.fareDetailsBySegment?.[0]?.includedCheckedBags?.quantity || 0;

    return {
      offerId: flightPriceOfferResponse.offerId,
      provider: flightPriceOfferResponse.provider,
      price: {
        currency: offer.price.currency,
        total: offer.price.total,
        base: offer.price.base,
        grandTotal: offer.price.grandTotal,
      },
      itineraries,
      airline: offer.validatingAirlineCodes?.[0],
      cabinClass,
      baggage,
      warnings,
    };
  }
}
