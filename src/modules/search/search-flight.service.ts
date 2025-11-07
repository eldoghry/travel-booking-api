import { Injectable } from "@nestjs/common";
import { SearchCacheService } from "./search-cache.service";
import { SearchFlightCriteriaDto } from "./dto/search-flight-criteria.dto";
import { FlightItemFormat, SearchFlightResponse } from "./interface/search-flight-response.interface";

@Injectable()
export class SearchFlightService {
    constructor(private readonly searchCacheService: SearchCacheService) { }

    private formatFlightItem(data: any): FlightItemFormat {
        const {
            id,
            oneWay,
            itineraries,
            price,
            numberOfBookableSeats,
        } = data;


        const segmentsData = itineraries[0].segments.map((segment: any) => ({
            departure: {
                iataCode: segment.departure.iataCode,
                terminal: segment.departure.terminal || null,
                time: segment.departure.at,
            },
            arrival: {
                iataCode: segment.arrival.iataCode,
                terminal: segment.arrival.terminal || null,
                time: segment.arrival.at,
            },
            airline: {
                code: segment.carrierCode,
                operatingCode: segment.operating?.carrierCode || segment.carrierCode,
            },
            flightNumber: segment.number,
            aircraft: segment.aircraft?.code,
            duration: segment.duration,
            stops: segment.numberOfStops
        }));


        const formattedPrice = {
            currency: price.currency,
            total: price.total,
            base: price.base,
        };


        const item = {
            id,
            oneWay,
            availableSeats: numberOfBookableSeats,
            price: formattedPrice,
            segments: segmentsData,
        };

        return item;
    }

    async searchFlights(criteria: SearchFlightCriteriaDto, customerId: string): Promise<SearchFlightResponse> {
        const apiUrl = `${process.env.BASE_URL}/flights/search`;
        const results = await this.searchCacheService.searchWithCache('search-flights', criteria, customerId, apiUrl);
        const formatedResults = results.data.providerResult.data.map((result: any) => this.formatFlightItem(result));
        return { data: formatedResults };
    }
}
