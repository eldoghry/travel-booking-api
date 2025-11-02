interface Segment {
    departure: {
      iataCode: string;
      time: string;
      terminal?: string | null;
    };
    arrival: {
      iataCode: string;
      time: string;
      terminal?: string | null;
    };
    airline: {
      code: string;
      operatingCode?: string;
      name?: string;
    };
    flightNumber: string;
    aircraft: string;
    duration: string;
    stops: number;
}

export interface SearchFlightItemFormat {
  id: string;
  oneWay: boolean;
  availableSeats: number;
  price: {
    currency: string;
    base: string;
    total: string;
  };
  segments: Segment[];
}

export interface SearchFlightResponse {
    data: SearchFlightItemFormat[];
}
