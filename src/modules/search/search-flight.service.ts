import { Injectable } from "@nestjs/common";
import { SearchBaseService } from "./search-base.service";
import { SearchFlightCriteriaDto } from "./dto/search-flight-criteria.dto";
import { SearchFlightItemFormat, SearchFlightResponse } from "./interface/search-flight-response.interface";

@Injectable()
export class SearchFlightService {
    constructor(private readonly searchBaseService: SearchBaseService) { }

    private serchFlightsItemFormat(data: any): SearchFlightItemFormat {
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



    async searchForFlights(criteria: SearchFlightCriteriaDto, customerId: string): Promise<SearchFlightResponse> {
        const apiUrl = `${process.env.BASE_URL}/flights/search`;
        const results = await this.searchBaseService.searchWithCache('search-flights', criteria, customerId, apiUrl);
        const formatedResults = results.data.providerResult.data.map((result: any) => this.serchFlightsItemFormat(result));
        return { data: formatedResults };
    }
}
