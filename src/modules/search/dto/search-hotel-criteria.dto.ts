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
} from 'class-validator';
import { IsIataCode } from '../../../validators/is-iataCode.validator';

export enum SortByOption {
  PRICE_ASC = 'PRICE_ASC',
  PRICE_DESC = 'PRICE_DESC',
  DISTANCE_ASC = 'DISTANCE_ASC',
  RATING_ASC = 'RATING_ASC',
  RATING_DESC = 'RATING_DESC',
}

export enum RadiusUnitOption {
  KM = 'KM',
  MI = 'MI',
}

export class SearchHotelCriteriaDto {
  @ApiPropertyOptional({
    example: 'RUH',
    description: 'City IATA code (required if latitude and longitude not provided)',
  })
  @ValidateIf((dto) => !dto.latitude && !dto.longitude) 
  @IsString()
  @IsIataCode()
  cityCode?: string;

  @ApiProperty({
    example: '2025-12-10',
    description: 'Check-in date in YYYY-MM-DD format',
  })
  @IsDateString()
  checkInDate: string;

  @ApiProperty({
    example: '2025-12-15',
    description: 'Check-out date in YYYY-MM-DD format',
  })
  @IsDateString()
  checkOutDate: string;

  @ApiPropertyOptional({
    example: 2,
    description: 'Number of adult guests (default 1)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  adults?: number = 1;

  @ApiPropertyOptional({
    example: 1,
    description: 'Number of children guests (default 0)',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number = 0;

  @ApiPropertyOptional({
    example: 1,
    description: 'Number of rooms requested (default 1)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  roomQuantity?: number = 1;

  @ApiPropertyOptional({
    example: 24.7136,
    description: 'Latitude for nearby search (alternative to cityCode)',
  })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({
    example: 46.6753,
    description: 'Longitude for nearby search (alternative to cityCode)',
  })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({
    example: 5,
    description: 'Radius in kilometers for nearby search (max 10km)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  radius?: number;

  @ApiPropertyOptional({
    example: 'km',
    description: 'Radius unit (default: km)',
  })
  @IsOptional()
  @IsString()
  @IsEnum(RadiusUnitOption)
  radiusUnit?: RadiusUnitOption = RadiusUnitOption.KM;

  @ApiPropertyOptional({
    enum: SortByOption,
    example: SortByOption.DISTANCE_ASC,
    description: 'Sort order of hotel results',
  })
  @IsOptional()
  @IsEnum(SortByOption)
  sort?: SortByOption = SortByOption.DISTANCE_ASC;

  @ApiPropertyOptional({
    example: 'USD',
    description: 'Preferred currency (default: USD)',
  })
  @IsOptional()
  @IsString()
  currency?: string = 'USD'
}
