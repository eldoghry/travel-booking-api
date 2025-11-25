import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Body,
  Param,
  ParseArrayPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import {
  HotelsByHotelsDto,
  HotelsByCityDto,
  HotelsByGeocodeDto,
  HotelsReferenceResponseDto,
} from './dto/hotel-reference.dto';
import { HotelOffersSearchDto, HotelOffersListResponseDto } from './dto/hotel-offers.dto';
import { HotelOfferDetailsDto, HotelOfferDetailsResponseDto } from './dto/hotel-offer-details.dto';
import { HotelOrderBookingDto, HotelOrderBookingResponseDto } from './dto/hotel-order-book.dto';

@ApiTags('Hotels')
@ApiBearerAuth('JWT')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  // Reference data endpoints
  @Get('by-hotels')
  @ApiQuery({ type: HotelsByHotelsDto })
  @ApiResponse({ status: HttpStatus.OK, type: HotelsReferenceResponseDto })
  @HttpCode(HttpStatus.OK)
  getHotelsByHotels(
    @Query('hotelIds', new ParseArrayPipe({ items: String, separator: ',', optional: false }))
    hotelIds: string[],
  ) {
    const dto: HotelsByHotelsDto = { hotelIds };
    return this.hotelsService.getHotelsByHotels(dto);
  }

  @Get('by-city')
  @ApiQuery({ type: HotelsByCityDto })
  @ApiResponse({ status: HttpStatus.OK, type: HotelsReferenceResponseDto })
  @HttpCode(HttpStatus.OK)
  getHotelsByCity(@Query() dto: HotelsByCityDto) {
    return this.hotelsService.getHotelsByCity(dto);
  }

  @Get('by-geocode')
  @ApiQuery({ type: HotelsByGeocodeDto })
  @ApiResponse({ status: HttpStatus.OK, type: HotelsReferenceResponseDto })
  @HttpCode(HttpStatus.OK)
  getHotelsByGeocode(@Query() dto: HotelsByGeocodeDto) {
    return this.hotelsService.getHotelsByGeocode(dto);
  }

  // Offers list
  @Get('offers')
  @ApiQuery({ type: HotelOffersSearchDto })
  @ApiResponse({ status: HttpStatus.OK, type: HotelOffersListResponseDto })
  @HttpCode(HttpStatus.OK)
  listHotelOffers(
    @Query('hotelIds', new ParseArrayPipe({ items: String, separator: ',' }))
    hotelIds: string[],
    @Query() rest: Omit<HotelOffersSearchDto, 'hotelIds'>,
  ) {
    const dto: HotelOffersSearchDto = { ...rest, hotelIds };
    return this.hotelsService.listHotelOffers(dto);
  }

  // Offer details by ID
  @Get('offers/:offerId')
  @ApiParam({ name: 'offerId', type: String })
  @ApiResponse({ status: HttpStatus.OK, type: HotelOfferDetailsResponseDto })
  @HttpCode(HttpStatus.OK)
  getHotelOfferDetails(@Param() params: HotelOfferDetailsDto) {
    return this.hotelsService.getHotelOfferDetails(params);
  }

  // Booking
  @Post('book')
  @ApiBody({ type: HotelOrderBookingDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: HotelOrderBookingResponseDto })
  @HttpCode(HttpStatus.CREATED)
  bookHotel(@Body() dto: HotelOrderBookingDto) {
    return this.hotelsService.bookHotel(dto);
  }
}
