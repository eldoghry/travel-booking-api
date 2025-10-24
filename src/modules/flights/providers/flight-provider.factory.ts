import { FlightProvider } from '../interfaces/flight-provider.interface';
import { AmadeusFlightProvider } from './amadeus-flight.provider';

export class FlightProviderFactory {
  static createProvider(type: string): FlightProvider {
    switch (type) {
      case 'amadeus':
        return new AmadeusFlightProvider();
      // later add different providers
      default:
        throw new Error('Unknown flight provider');
    }
  }
}
