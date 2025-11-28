import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  Matches,
  IsDateString,
  IsIn,
  IsBoolean,
} from 'class-validator';

export class HotelOffersSearchDto {
  @ApiPropertyOptional({ type: [String], example: ['MCLONGHM'] })
  @IsArray()
  @IsString({ each: true })
  hotelIds: string[];

  @ApiPropertyOptional({ example: 51.50988 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -0.15509 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: '2023-11-22',
    description: 'Check-in date of the stay (hotel local date). Format YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString()
  checkInDate?: string;

  @ApiPropertyOptional({
    example: '2023-11-23',
    description: 'Check-out date of the stay (hotel local date). Format YYYY-MM-DD.',
  })
  @IsOptional()
  @IsDateString()
  checkOutDate?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Number of adult guests (1-9) per room.',
    minimum: 1,
    maximum: 9,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  adults?: number;

  @ApiPropertyOptional({
    example: 'EG',
    description: 'Code of the country of residence of the traveler (ISO 3166-1 alpha-2).',
    pattern: '[A-Z]{2}',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/)
  countryOfResidence?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Number of rooms requested (1-9).',
    minimum: 1,
    maximum: 9,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  roomQuantity?: number;

  @ApiPropertyOptional({
    example: '200-300',
    description:
      'Filter hotel offers by price per night interval (ex: 200-300 or -300 or 100). It is mandatory to include a currency when this field is set.',
  })
  @IsOptional()
  @IsString()
  priceRange?: string;

  @ApiPropertyOptional({
    example: 'GBP',
    description:
      'Currency in ISO 4217 format. If a hotel does not support the requested currency, the prices for the hotel will be returned in the local currency of the hotel.',
    pattern: '^[A-Z]{3}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiPropertyOptional({
    example: 'NONE',
    enum: ['GUARANTEE', 'DEPOSIT', 'NONE'],
    description:
      'Filter the response based on a specific payment type. NONE means all types (default).',
    default: 'NONE',
  })
  @IsOptional()
  @IsString()
  @IsIn(['GUARANTEE', 'DEPOSIT', 'NONE'])
  paymentPolicy?: 'GUARANTEE' | 'DEPOSIT' | 'NONE';

  @ApiPropertyOptional({
    example: 'ROOM_ONLY',
    enum: ['ROOM_ONLY', 'BREAKFAST', 'HALF_BOARD', 'FULL_BOARD', 'ALL_INCLUSIVE'],
    description:
      'Filter response based on available meals: ROOM_ONLY, BREAKFAST, HALF_BOARD, FULL_BOARD, ALL_INCLUSIVE.',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ROOM_ONLY', 'BREAKFAST', 'HALF_BOARD', 'FULL_BOARD', 'ALL_INCLUSIVE'])
  boardType?: 'ROOM_ONLY' | 'BREAKFAST' | 'HALF_BOARD' | 'FULL_BOARD' | 'ALL_INCLUSIVE';

  @ApiPropertyOptional({
    example: false,
    description: 'Show all properties (include sold out) or available only.',
  })
  @IsOptional()
  @IsBoolean()
  includeClosed?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Used to return only the cheapest offer per hotel or all available offers.',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  bestRateOnly?: boolean;

  @ApiPropertyOptional({
    example: 'en-US',
    description: 'Requested language of descriptive texts, e.g., FR, fr, fr-FR.',
    pattern: '^[a-zA-Z0-9-]{2,5}$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9-]{2,5}$/)
  lang?: string;
}

export class HotelOfferRoomDto {
  @ApiProperty({ example: 'EXECUTIVE_ROOM' })
  category?: string;

  @ApiProperty({ example: 1 })
  beds?: number;

  @ApiProperty({ example: 'DOUBLE' })
  bedType?: string;

  @ApiProperty({ example: 'Executive King Room, Executive Lounge Access...' })
  description?: string;
}

export class HotelOfferPriceDto {
  @ApiProperty({ example: 'GBP' })
  currency: string;

  @ApiProperty({ example: 716 })
  base: number | string;

  @ApiProperty({ example: 716 })
  total: number | string;

  @ApiPropertyOptional({ example: 716 })
  averagePerNight?: number | string;
}

export class HotelOfferPoliciesDto {
  @ApiProperty({ example: 'deposit' })
  paymentType?: string;

  @ApiProperty({ example: 'NON-REFUNDABLE RATE' })
  cancellation?: string;
}

export class HotelOfferItemDto {
  @ApiProperty({ example: 'TSXOJ6LFQ2' })
  offerId: string;

  @ApiProperty({ example: '2023-11-22' })
  checkInDate: string;

  @ApiProperty({ example: '2023-11-23' })
  checkOutDate: string;

  @ApiProperty({ type: HotelOfferRoomDto })
  room: HotelOfferRoomDto;

  @ApiProperty({ type: HotelOfferPriceDto })
  price: HotelOfferPriceDto;

  @ApiProperty({ type: HotelOfferPoliciesDto })
  policies?: HotelOfferPoliciesDto;
}

export class HotelOffersHotelDto {
  @ApiProperty({ example: 'MCLONGHM' })
  hotelId: string;

  @ApiProperty({ example: 'JW Marriott Grosvenor House London' })
  name: string;

  @ApiProperty({ example: 'MC' })
  chainCode: string;

  @ApiProperty({ example: 'LON' })
  cityCode: string;

  @ApiProperty({ example: 51.50988 })
  latitude: number;

  @ApiProperty({ example: -0.15509 })
  longitude: number;

  @ApiProperty({ type: [HotelOfferItemDto] })
  offers: HotelOfferItemDto[];
}

export class HotelOffersListResponseDto {
  @ApiProperty({ type: [HotelOffersHotelDto] })
  hotels: HotelOffersHotelDto[];
}
