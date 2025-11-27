import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { IsIataCode } from '../../../validators/is-iataCode.validator';

export class SearchFlightCriteriaDto {
  @ApiProperty({ example: 'CAI' , description: 'Origin airport IATA code' })
  @IsNotEmpty()
  @IsIataCode()
  origin: string;

  @ApiProperty({ example: 'JED' , description: 'Destination airport IATA code' })
  @IsNotEmpty()
  @IsIataCode()
  destination: string;

  @ApiProperty({ example: '2025-12-01' , description: 'Departure date in YYYY-MM-DD format' })
  @IsDateString()
  departureDate: string;

  @ApiPropertyOptional({ example: '2026-12-31' , description: 'Return date in YYYY-MM-DD format' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiProperty({ example: 1 , description: 'Number of adults' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  adults: number = 1;

  @ApiPropertyOptional({ example: 0 , description: 'Number of children' })
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number = 0;

  @ApiPropertyOptional({ example: 0 , description: 'Number of infants' })
  @IsOptional()
  @IsInt()
  @Min(0)
  infants?: number = 0;

  @ApiPropertyOptional({ example: 'economy' , description: 'Travel class' })
  @IsOptional()
  @IsEnum(['economy', 'business', 'first'])
  travelClass?: string = 'economy';

  @ApiPropertyOptional({ example: false , description: 'Non-stop flights only' })
  @IsOptional()
  @IsBoolean()
  nonStop?: boolean = true;

  @ApiPropertyOptional({ example: '6X,7X,8X' , description: 'Included airline codes' })
  @IsOptional()
  @IsString()
  @Min(1)
  includedAirlineCodes?: string;

  @ApiPropertyOptional({ example: '6X,7X' , description: 'Excluded airline codes' })
  @IsOptional()
  @IsString()
  @Min(1)
  excludedAirlineCodes?: string;

  @ApiPropertyOptional({ example: 100000 , description: 'Maximum price' })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxPrice?: number;

  @ApiPropertyOptional({ example: 'USD' , description: 'Preferred currency' })
  @IsOptional()
  @IsString()
  currency?: string = 'USD'
}
