import { Injectable } from "@nestjs/common";
import { SearchCacheService } from "./search-cache.service";
import { SearchFlightCriteriaDto } from "./dto/search-flight-criteria.dto";
import { FlightItemFormat, SearchFlightResponse } from "./interfaces/search-flight-response.interface";

@Injectable()
export class SearchFlightService {
    constructor(private readonly searchCacheService: SearchCacheService) { }

    private formatFlightItem(data: any): FlightItemFormat {
        const {
            provider,
            id,
            isRoundTrip,
            trips,
            price,
            numberOfBookableSeats,
        } = data;


        const segmentsData = trips.map((trip: any) => ({
            departure: {
                iataCode: trip.from,
                time: trip.departureTime,
            },
            arrival: {
                iataCode: trip.to,
                time: trip.arrivalTime,
            },
            airlineCode: trip.airlineCode,
            flightNumber: trip.airlineCode + trip.number,
            duration: trip.duration,
            stops: trip.stops,
        }));


        const formattedPrice = {
            currency: price.currency,
            total: price.total,
            base: price.base,
        };


        const item = {
            provider,
            id,
            isRoundTrip,
            availableSeats: numberOfBookableSeats,
            price: formattedPrice,
            trips: segmentsData,
        };

        return item;
    }

    async searchFlights(criteria: SearchFlightCriteriaDto, customerId: string): Promise<SearchFlightResponse> {
        const apiUrl = `${process.env.BASE_URL}/flights/search`;
        const results = await this.searchCacheService.searchWithCache('search-flights', criteria, customerId, apiUrl);
        const formatedResults = results.data.summary.map((result: any) => this.formatFlightItem(result));
        return { data: formatedResults };
    }
}
