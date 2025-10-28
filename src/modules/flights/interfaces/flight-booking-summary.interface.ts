export interface FlightBookingSummary {
  orderId: string;
  provider: string;
  pnr: string;
  totalPrice: string;
  currency: string;
  airline: string;
  travelers: {
    id: string;
    fullName: string;
    gender: string;
    dateOfBirth: string;
  }[];
  itineraries: {
    from: string;
    to: string;
    departure: string;
    arrival: string;
    duration: string;
    segments: number;
  }[];
  documents: {
    type: string;
    number: string;
    nationality: string;
  }[];
  ticketingStatus: string;
  creationDate: string;
}
