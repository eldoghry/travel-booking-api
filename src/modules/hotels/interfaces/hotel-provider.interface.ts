export interface HotelProvider {
  providerName: string;

  // Reference data
  getHotelsByHotels(hotelIds: string[]): Promise<any>;
  getHotelsByCity(cityCode: string): Promise<any>;
  getHotelsByGeocode(
    latitude: number,
    longitude: number,
    radius?: number,
    radiusUnit?: string,
  ): Promise<any>;

  // Offers
  listHotelOffers(params: Record<string, any>): Promise<any>;
  getHotelOfferDetails(offerId: string): Promise<any>;

  // Booking
  bookHotelOrder(payload: any): Promise<any>;

  // Normalization helpers
  mapReferenceHotelsToResponse(response: any): { hotels: any[] };
  mapOffersListToResponse(response: any): { hotels: any[] };
  mapOfferDetailsToResponse(response: any): { hotelOffer: any };
  mapBookingToResponse(response: any): { booking: any };
}
