interface Trip {
    departure: {
      iataCode: string;
      time: string;
    };
    arrival: {
      iataCode: string;
      time: string;
    };
    airlineCode: string;
    flightNumber: string;
    duration: string;
    stops: number;
}

export interface FlightItemFormat {
  provider: string;
  id: string;
  isRoundTrip: boolean;
  availableSeats: number;
  price: {
    currency: string;
    base: string;
    total: string;
  };
  trips: Trip[];
}

export interface SearchFlightResponse {
    data: FlightItemFormat[];
}
