export class FlightSearchSummary {
  provider: string;
  id: string;
  price: {
    currency: string;
    total: number;
    base: number;
  };
  numberOfBookableSeats: number;
  isRoundTrip: boolean;
  trips: {
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    stops: number;
    airlineCode: string;
    number: string;
  }[];
  airlines: string[];
  lastTicketingDate: string;
  cabin?: string;
}
