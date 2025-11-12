export class FlightSearchSummary {
  provider: string;
  id: string;
  price: {
    currency: string;
    total: number;
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
  }[];
  airlines: string[];
  lastTicketingDate: string;
  cabin?: string;
}
