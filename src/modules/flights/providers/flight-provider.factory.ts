import { Injectable } from '@nestjs/common';
import { FlightProvider } from '../interfaces/flight-provider.interface';
import { AmadeusFlightProvider } from './amadeus-flight.provider';

@Injectable()
export class FlightProviderFactory {
  constructor(private readonly amadeusFlightProvider: AmadeusFlightProvider) {}

  createProvider(type: string): FlightProvider {
    switch (type) {
      case 'amadeus':
        return this.amadeusFlightProvider;
      // later add different providers
      default:
        throw new Error('Unknown flight provider');
    }
  }
}
