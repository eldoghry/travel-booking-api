import { Controller, Get, Post, Body, Param, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FlightBookingDto, FlightBookingResponseDto } from './dto/flight-book.dto';
import { FlightDetailsDto, FlightDetailsResponseDto } from './dto/flight-details.dto';
import { FlightSearchDto, FlightSearchResponseDto } from './dto/flight-search.dto';

@ApiTags('Flights')
@ApiBearerAuth('JWT')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get('search')
  @ApiQuery({ type: FlightSearchDto })
  @ApiResponse({ status: HttpStatus.OK, type: FlightSearchResponseDto })
  @HttpCode(HttpStatus.OK)
  searchFlights(@Query() searchFlightDto: FlightSearchDto) {
    return this.flightsService.searchFlights(searchFlightDto);
  }

  @Post('details')
  @ApiBody({ type: FlightDetailsDto })
  @ApiResponse({ status: HttpStatus.OK, type: FlightDetailsResponseDto })
  getFlightDetails(@Body() flightDetailsDto: FlightDetailsDto) {
    return this.flightsService.getFlightDetails(flightDetailsDto);
  }

  @Post('book')
  @ApiBody({ type: FlightBookingDto })
  @ApiResponse({ status: HttpStatus.OK, type: FlightBookingResponseDto })
  @HttpCode(HttpStatus.OK)
  bookFlight(@Body() flightBookingDto: FlightBookingDto) {
    return this.flightsService.bookFlight(flightBookingDto);
  }
}
