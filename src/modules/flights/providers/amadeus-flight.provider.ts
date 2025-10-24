import { FlightProvider } from '../interfaces/flight-provider.interface';

export class AmadeusFlightProvider implements FlightProvider {
  searchFlights(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
  getFlightDetails(flightId: string): Promise<any> {
    throw new Error('Method not implemented.');
  }
  bookFlight(data: any): Promise<any> {
    throw new Error('Method not implemented.');
  }
}
