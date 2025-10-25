import { IsString } from 'class-validator';

export class FlightDetailsDto {
  @IsString()
  provider: string;

  @IsString()
  searchId: string;

  @IsString()
  flightId: string;
}

export class FlightDetailsResponseDto {}
