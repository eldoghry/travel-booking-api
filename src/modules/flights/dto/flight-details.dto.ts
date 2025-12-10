import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import type { FlightSummary } from '../interfaces/fligth-summary.interface';

export class FlightDetailsDto {
  @ApiProperty()
  @IsString()
  provider: string;

  // @ApiProperty()
  // @IsString()
  // searchId: string;

  @ApiProperty({ example: '1' })
  @IsString()
  flightId: string;

  @ApiProperty()
  @IsObject()
  providerResult: Record<string, any>;
}

export class FlightDetailsResponseDto extends FlightDetailsDto {
  // @ApiProperty()
  // @IsString()
  // offerPriceId: string;

  @ApiProperty()
  summary: FlightSummary;
}
