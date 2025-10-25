import { FlightSummary } from './fligth-summary.interface';

export interface FlightProvider {
  providerName: string;

  searchFlights(data: any): Promise<any>;
  getFlightDetails(flightId: string): Promise<any>;
  bookFlight(data: any): Promise<any>;

  //
  getFlightPriceSummary(response: any): FlightSummary;
}
