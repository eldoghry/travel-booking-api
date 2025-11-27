import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsNumber,
  ValidateIf,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { IsIataCode } from '../../../validators/is-iataCode.validator';
import { RadiusUnitOption } from '../enums/search-hotel.enum';
import { SortByOption } from '../enums/search-hotel.enum';
import { Transform } from 'class-transformer';

export class SearchHotelCriteriaDto {
  @ApiPropertyOptional({
    example: 'RUH',
    description: 'City IATA code (required if latitude and longitude not provided)',
    type: String,
  })
  @ValidateIf((dto) => !dto.latitude && !dto.longitude && !dto.hotelIds)
  @IsString()
  @IsIataCode()
  cityCode?: string;

  @ApiPropertyOptional({
    example: ['HOTEL_1', 'HOTEL_2'],
    description: 'List of hotel IDs to search for',
    type: [String],
  })
  @ValidateIf((dto) => !dto.cityCode && dto.latitude && dto.longitude)
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  hotelIds?: string[];

  @ApiProperty({
    example: '2025-12-10',
    description: 'Check-in date in YYYY-MM-DD format',
    type: String,
  })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({
    example: '2025-12-15',
    description: 'Check-out date in YYYY-MM-DD format',
    type: String,
  })
  @IsDateString()
  checkOutDate: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Number of adult guests (default 1)',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  adults: number = 1;

  @ApiPropertyOptional({
    example: 1,
    description: 'Number of children guests (default 0)',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number = 0;

  @ApiPropertyOptional({
    example: 1,
    description: 'Number of rooms requested (default 1)',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  roomQuantity?: number = 1;

  @ApiPropertyOptional({
    example: 24.7136,
    description: 'Latitude for nearby search (alternative to cityCode)',
    type: Number,
  })
  @ValidateIf((dto) => !dto.cityCode && dto.longitude && dto.hotelIds)
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    example: 46.6753,
    description: 'Longitude for nearby search (alternative to cityCode)',
    type: Number,
  })
  @ValidateIf((dto) => !dto.cityCode && dto.latitude && dto.hotelIds)
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Radius in kilometers for nearby search (max 10km)',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  radius?: number;

  @ApiPropertyOptional({
    example: 'km',
    description: 'Radius unit (default: km)',
    type: String,
  })
  @IsOptional()
  @IsString()
  @IsEnum(RadiusUnitOption)
  radiusUnit?: RadiusUnitOption = RadiusUnitOption.KM;

  @ApiPropertyOptional({
    enum: SortByOption,
    example: SortByOption.DISTANCE_ASC,
    description: 'Sort order of hotel results',
    type: String,
  })
  @IsOptional()
  @IsEnum(SortByOption)
  sort?: SortByOption = SortByOption.DISTANCE_ASC;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Preferred currency (default: USD)',
    type: String,
  })
  @IsOptional()
  @IsString()
  currency?: string = 'USD'

  @ApiPropertyOptional({
    example: '200-300',
    description: 'Filter by price per night interval',
    type: String,
  })
  @IsOptional()
  @IsString()
  priceRange?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Only return the best rate offer',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  bestRateOnly?: boolean = false;
}
