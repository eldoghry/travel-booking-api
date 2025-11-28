export enum AmadeusEndpoints {
  // Login routes
  AUTHENTICATE = '/v1/security/oauth2/token',

  // Flight routes
  FLIGHT_SEARCH = '/v2/shopping/flight-offers', // What are the cheapest flights from Madrid to Paris on June 1st?
  FLIGHT_OFFER_PRICE = '/v1/shopping/flight-offers/pricing', // What's the final price for this flight?
  FLIGHT_BOOKING = '/v1/booking/flight-orders', // How can I book this flight?

  // Hotel routes
  HOTEL_REFERENCE_BY_HOTELS = '/v1/reference-data/locations/hotels/by-hotels',
  HOTEL_REFERENCE_BY_CITY = '/v1/reference-data/locations/hotels/by-city',
  HOTEL_REFERENCE_BY_GEOCODE = '/v1/reference-data/locations/hotels/by-geocode',
  HOTEL_OFFERS_LIST = '/v3/shopping/hotel-offers',
  HOTEL_OFFER_DETAILS = '/v3/shopping/hotel-offers/{offerId}',
  HOTEL_ORDER_BOOKING = '/v2/booking/hotel-orders',
}
