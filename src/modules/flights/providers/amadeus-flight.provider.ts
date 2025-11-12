import { FlightProvider } from '../interfaces/flight-provider.interface';
import { FlightSearchDto } from '../dto/flight-search.dto';
import { AmadeusAxiosService } from 'src/common/amadeus/amadeus-axios.service';
import { AxiosInstance } from 'axios';
import { Injectable } from '@nestjs/common';
import { AmadeusEndpoints } from 'src/common/amadeus/amadeus-request';
import { formatDateToYMD } from 'src/common/utils/helper';
import { FlightSummary } from '../interfaces/fligth-summary.interface';
import { FlightBookingSummary } from '../interfaces/flight-booking-summary.interface';
import { FlightSearchSummary } from '../interfaces/flight-search-summary.interface';

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
    const { travelers, ...other } = flightPriceOffer;
    const payload = {
      data: {
        type: 'flight-order',
        flightOffers: [...other.flightOffers],
        travelers: flightPriceOffer.travelers,
      },
    };

    const data = await this.axios.post(AmadeusEndpoints.FLIGHT_BOOKING, { ...payload });
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

  getFlightBookingSummary(flightBookingResponse: any): FlightBookingSummary {
    const data = flightBookingResponse?.data;
    const provider = 'amadeus';
    const orderId = data?.id;
    const flightOffer = data?.flightOffers?.[0];
    const pnr = data?.associatedRecords?.[0]?.reference || '';
    const creationDate = data?.associatedRecords?.[0]?.creationDate || '';
    const airline = flightOffer?.validatingAirlineCodes?.[0] || 'UNKNOWN';
    const price = flightOffer?.price || {};

    // --- Travelers ---
    const travelers = (data?.travelers || []).map((t: any) => ({
      id: t.id,
      fullName: `${t.name.firstName} ${t.name.lastName}`,
      gender: t.gender,
      dateOfBirth: t.dateOfBirth,
    }));

    // --- Documents ---
    const documents = (data?.travelers?.[0]?.documents || []).map((d: any) => ({
      type: d.documentType,
      number: d.number,
      nationality: d.nationality,
    }));

    // --- Itineraries ---
    const itineraries =
      flightOffer?.itineraries?.map((it: any) => {
        const firstSeg = it.segments[0];
        const lastSeg = it.segments[it.segments.length - 1];
        return {
          from: firstSeg.departure.iataCode,
          to: lastSeg.arrival.iataCode,
          departure: firstSeg.departure.at,
          arrival: lastSeg.arrival.at,
          duration: it.segments
            .map((s: any) => s.duration.replace('PT', '').replace('H', 'h ').replace('M', 'm'))
            .join(' + '),
          segments: it.segments.length,
        };
      }) || [];

    return {
      orderId,
      provider,
      pnr,
      totalPrice: price.total,
      currency: price.currency,
      airline,
      travelers,
      itineraries,
      documents,
      ticketingStatus: data.ticketingAgreement?.option || 'UNKNOWN',
      creationDate,
    };
  }

  getFlightSearchSummary(flightOffer: any): FlightSearchSummary {
    const trips = flightOffer.itineraries.map((it) => ({
      from: it.segments[0].departure.iataCode,
      to: it.segments[it.segments.length - 1].arrival.iataCode,
      departureTime: it.segments[0].departure.at,
      arrivalTime: it.segments[it.segments.length - 1].arrival.at,
      duration: it.duration,
      stops: it.segments.length - 1,
    }));

    return {
      provider: 'amadeus',
      id: flightOffer.id,
      price: {
        currency: flightOffer.price.currency,
        total: parseFloat(flightOffer.price.total),
      },
      numberOfBookableSeats: flightOffer.numberOfBookableSeats,
      isRoundTrip: flightOffer.itineraries.length > 1,
      trips,
      airlines: flightOffer.validatingAirlineCodes,
      lastTicketingDate: flightOffer.lastTicketingDate,
      cabin: flightOffer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin || null,
    };
  }
}
