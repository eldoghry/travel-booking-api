import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { IsIataCode } from '../../../validators/is-iataCode.validator';

export class SearchFlightCriteriaDto {
  @ApiProperty({ example: 'CAI' })
  @IsNotEmpty()
  @IsIataCode()
  origin: string;

  @ApiProperty({ example: 'JED' })
  @IsNotEmpty()
  @IsIataCode()
  destination: string;

  @ApiProperty({ example: '2025-12-01' })
  @IsDate()
  departureDate: Date;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDate()
  returnDate?: Date;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  adults: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  infants?: number;

  @ApiPropertyOptional({ example: 'ECONOMY' })
  @IsOptional()
  @IsEnum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'])
  travelClass?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  nonStop?: boolean;

  @ApiPropertyOptional({ example: '6X,7X,8X' })
  @IsOptional()
  @IsString()
  @Min(1)
  includedAirlineCodes?: string;

  @ApiPropertyOptional({ example: '6X,7X' })
  @IsOptional()
  @IsString()
  @Min(1)
  excludedAirlineCodes?: string;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxPrice?: number;
}
