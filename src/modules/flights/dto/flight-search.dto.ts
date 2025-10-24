import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FlightSearchDto {
  @ApiProperty({ example: 'CAI' })
  @IsString()
  origin: string;

  @ApiProperty({ example: 'JED' })
  @IsString()
  destination: string;

  @ApiProperty({ example: '2025-12-01' })
  @IsDate()
  departureDate: Date;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDate()
  returnDate?: Date;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  adults?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  children?: number;

  @ApiPropertyOptional({ example: 'economy' })
  @IsOptional()
  @IsEnum(['economy', 'business', 'first'])
  travelClass?: string;

  @ApiPropertyOptional({ example: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}

export class FlightSearchResponseDto {}
