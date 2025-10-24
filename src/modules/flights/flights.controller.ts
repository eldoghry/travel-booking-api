import { Controller, Get, Post, Body, Param, HttpStatus, HttpCode } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FlightBookingDto, FlightBookingResponseDto } from './dto/flight-book.dto';
import { FlightDetailsDto, FlightDetailsResponseDto } from './dto/flight-details.dto';
import { FlightSearchDto, FlightSearchResponseDto } from './dto/flight-search.dto';

@ApiTags('flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Post('search')
  @ApiBody({ type: FlightSearchDto })
  @ApiResponse({ status: HttpStatus.OK, type: FlightSearchResponseDto })
  @HttpCode(HttpStatus.OK)
  searchFlights(@Body() searchFlightDto: FlightSearchDto) {
    return this.flightsService.searchFlights(searchFlightDto);
  }

  @Get('details/:id')
  @ApiBody({ type: FlightDetailsDto })
  @ApiResponse({ status: HttpStatus.OK, type: FlightDetailsResponseDto })
  getFlightDetails(@Param('id') id: string) {
    return this.flightsService.getFlightDetails(id);
  }

  @Post('book')
  @ApiBody({ type: FlightBookingDto })
  @ApiResponse({ status: HttpStatus.OK, type: FlightBookingResponseDto })
  @HttpCode(HttpStatus.OK)
  bookFlight(@Body() flightBookingDto: FlightBookingDto) {
    return this.flightsService.bookFlight(flightBookingDto);
  }
}
