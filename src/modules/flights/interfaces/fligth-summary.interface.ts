export interface FlightSummary {
  offerId: string;
  provider: string;
  price: {
    currency: string;
    total: string;
    base: string;
    grandTotal: string;
  };
  itineraries: {
    from: string;
    to: string;
    departure: string;
    arrival: string;
    duration: string;
    segments: number;
  }[];
  airline: string;
  cabinClass: string;
  baggage: number;
  warnings?: any[];
}
