import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FlightDetailsDto {
  @ApiProperty()
  @IsString()
  provider: string;

  @ApiProperty()
  @IsString()
  searchId: string;

  @ApiProperty({ example: '1' })
  @IsString()
  flightId: string;
}

export class FlightDetailsResponseDto {}
