import { FlightBookingSummary } from './flight-booking-summary.interface';
import { FlightSummary } from './fligth-summary.interface';

export interface FlightProvider {
  providerName: string;

  searchFlights(data: any): Promise<any>;
  getFlightDetails(flightId: string): Promise<any>;
  bookFlight(data: any): Promise<any>;

  // extract summary from provider response for simplicity
  getFlightPriceSummary(response: any): FlightSummary;
  getFlightBookingSummary(response: any): FlightBookingSummary;
}
