export enum AmadeusEndpoints {
  // Login routes
  AUTHENTICATE = '/v1/security/oauth2/token',

  // Flight routes
  FLIGHT_SEARCH = '/v2/shopping/flight-offers', // What are the cheapest flights from Madrid to Paris on June 1st?
  FLIGHT_OFFER_PRICE = '/v1/shopping/flight-offers/pricing', // What's the final price for this flight?
  FLIGHT_BOOKING = '/v1/booking/flight-orders', // How can I book this flight?

  // Hotel routes
}
