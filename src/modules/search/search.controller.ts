import { Controller, Get, Query, Request } from "@nestjs/common";
import { SearchFlightService } from "./search-flight.service";
import { Public } from "nest-keycloak-connect";
import { SearchFlightCriteriaDto } from "./dto/search-flight-criteria.dto";
import { SearchHotelService } from "./search-hotel.service";
import { SearchHotelCriteriaDto } from "./dto/search-hotel-criteria.dto";

@Public()
@Controller('search')
export class SearchController {
  constructor(private readonly searchFlightService: SearchFlightService, private readonly searchHotelService: SearchHotelService) { }

  @Get('flights')
  async searchFlights(@Query() flightSearchCriteriaDTO: SearchFlightCriteriaDto, @Request() req) {
    const guestId = req.cookies?.guestId;
    const userId = req.user?.id;
    const customerId = userId || guestId;

    const result = await this.searchFlightService.searchFlights(flightSearchCriteriaDTO, customerId);
    return result;
  }

  @Get('hotels')
  async searchHotels(@Query() hotelSearchCriteriaDTO: SearchHotelCriteriaDto, @Request() req) {
    const guestId = req.cookies?.guestId;
    const userId = req.user?.id;
    const customerId = userId || guestId;

    const result = await this.searchHotelService.searchHotels(hotelSearchCriteriaDTO, customerId);
    return result;
  }
}
