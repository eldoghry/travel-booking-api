export interface FlightProvider {
  searchFlights(data: any): Promise<any>;
  getFlightDetails(flightId: string): Promise<any>;
  bookFlight(data: any): Promise<any>;
}
