import { Controller, Get, Query, Request } from "@nestjs/common";
import { SearchFlightService } from "./search-flight.service";
import { Public } from "nest-keycloak-connect";
import { SearchFlightCriteriaDto } from "./dto/search-flight-criteria.dto";

@Public()
@Controller('search')
export class SearchController {
  constructor(private readonly searchFlightService: SearchFlightService) {}

  @Get('flights')
  async searchFlights(@Query() flightSearchCriteriaDTO: SearchFlightCriteriaDto,@Request() req) {
    const guestId = req.cookies?.guestId;
    const userId = req.user?.id;
    const customerId = userId || guestId;

    const result = await this.searchFlightService.searchForFlights(flightSearchCriteriaDTO,customerId);
    return result;
  }

}
 