import request from 'supertest';
import { setupTestApp, teardownTestApp, TestAppContext } from '../../../../test/testcontainers-setup';
import nock from 'nock';

describe('SearchModule (Integration)', () => {
  let testContext: TestAppContext;

  const apiQuery = {
    origin: 'CAI',
    destination: 'JED',
    departureDate: '2025-12-01',
    adults: 2,
    returnDate: '2025-12-02',
    children: 0,
    infants: 0,
    travelClass: 'economy',
    nonStop: true,
    currency: 'USD'
  };

  const mockApiResponse = {
    statusCode: 200,
    timestamp: "2025-11-06T07:21:48.019Z",
    path: "/api/v1/flights/search?origin=CAI&departureDate=2025-12-01&adults=2&destination=JED&returnDate=2025-12-02&travelClass=economy&limit=1",
    data: {
      searchId: "e7105b38-1234-4600-a2a7-bed5d632f683",
      provider: "amadeus",
      providerResult: {
        meta: {
          count: 250,
          links: {
            self: "https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=CAI&destinationLocationCode=JED&departureDate=2025-12-01&returnDate=2025-12-02&adults=2"
          }
        },
        data: [
          {
            type: "flight-offer",
            id: "1",
            source: "GDS",
            instantTicketingRequired: false,
            nonHomogeneous: false,
            oneWay: false,
            isUpsellOffer: false,
            lastTicketingDate: "2025-11-07",
            lastTicketingDateTime: "2025-11-07",
            numberOfBookableSeats: 9,
            itineraries: [
              {
                duration: "PT7H20M",
                segments: [
                  {
                    departure: {
                      iataCode: "CAI",
                      terminal: "2",
                      at: "2025-12-01T23:35:00"
                    },
                    arrival: {
                      iataCode: "RUH",
                      terminal: "4",
                      at: "2025-12-02T03:10:00"
                    },
                    carrierCode: "SV",
                    number: "320",
                    aircraft: {
                      code: "330"
                    },
                    operating: {
                      carrierCode: "SV"
                    },
                    duration: "PT2H35M",
                    id: "44",
                    numberOfStops: 0,
                    blacklistedInEU: false
                  },
                  {
                    departure: {
                      iataCode: "RUH",
                      terminal: "5",
                      at: "2025-12-02T06:00:00"
                    },
                    arrival: {
                      iataCode: "JED",
                      terminal: "1",
                      at: "2025-12-02T07:55:00"
                    },
                    carrierCode: "SV",
                    number: "1019",
                    aircraft: {
                      code: "330"
                    },
                    operating: {
                      carrierCode: "SV"
                    },
                    duration: "PT1H55M",
                    id: "45",
                    numberOfStops: 0,
                    blacklistedInEU: false
                  }
                ]
              },
              {
                duration: "PT2H20M",
                segments: [
                  {
                    departure: {
                      iataCode: "JED",
                      terminal: "1",
                      at: "2025-12-02T14:40:00"
                    },
                    arrival: {
                      iataCode: "CAI",
                      terminal: "2",
                      at: "2025-12-02T16:00:00"
                    },
                    carrierCode: "SV",
                    number: "305",
                    aircraft: {
                      code: "330"
                    },
                    operating: {
                      carrierCode: "SV"
                    },
                    duration: "PT2H20M",
                    id: "80",
                    numberOfStops: 0,
                    blacklistedInEU: false
                  }
                ]
              }
            ],
            price: {
              currency: "EUR",
              total: "269.20",
              base: "40.00",
              fees: [
                {
                  amount: "0.00",
                  type: "SUPPLIER"
                },
                {
                  amount: "0.00",
                  type: "TICKETING"
                }
              ],
              grandTotal: "269.20",
              additionalServices: [
                {
                  amount: "153.08",
                  type: "CHECKED_BAGS"
                }
              ]
            },
          }
        ]
      }
    }
  };

  beforeAll(async () => {
    try {
      testContext = await setupTestApp({ withDatabase: false });
      // Enable network connections for test server but not external APIs
      // nock.cleanAll();
      nock.disableNetConnect();
      nock.enableNetConnect(/(localhost|127\.0\.0\.1)/);

      if (testContext?.redisService) {
        const client = testContext.redisService.getClient();
        await client.flushall();
      }
    } catch (error) {
      console.error('Failed to setup test:', error);
      throw error;
    }
  }, 120000);

  beforeEach(async () => {
    if (!testContext) {
      throw new Error('Test context not initialized - check Docker and beforeAll setup');
    }
    nock.cleanAll();
    // Clear Redis before each test to ensure clean state
    if (testContext?.redisService) {
      const client = testContext.redisService.getClient();
      await client.flushall();
    }
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(async () => {
    await teardownTestApp(testContext);
  }, 30000);

  describe('GET /api/v1/search/flights', () => {
    it('should create a guest ID & set in cookie if user is not logged in', async () => {
      const scope = nock('http://localhost:4000')
        .get('/api/v1/flights/search')
        .query(apiQuery)
        .reply(200, mockApiResponse);

      const res = await request(testContext!.app.getHttpServer())
        .get('/api/v1/search/flights')
        .query(apiQuery)
        .expect(200);

      expect(scope.isDone()).toBe(true);

      const setCookie = res.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      expect(setCookie[0]).toContain('guestId');
      expect(setCookie[0]).toContain('HttpOnly');
      expect(setCookie[0]).toContain('SameSite=Strict');
    });

    it('should call external API on cache miss and cache the response', async () => {
      const scope = nock('http://localhost:4000')
        .get('/api/v1/flights/search')
        .query(apiQuery)
        .reply(200, mockApiResponse);

      const res = await request(testContext!.app.getHttpServer())
        .get('/api/v1/search/flights')
        .query(apiQuery)
        .expect(200);

      expect(scope.isDone()).toBe(true); // External API called

      // Use RedisService to verify cache
      const redisClient = testContext!.redisService.getClient();
      const keys = await redisClient.keys('*search-flights*');
      expect(keys.length).toBeGreaterThan(0);

      // Verify cache data using RedisService
      const cachedData = await testContext!.redisService.get(keys[0]);
      expect(cachedData).toBeDefined();

      // Verify TTL is set
      const ttl = await redisClient.ttl(keys[0]);
      expect(ttl).toBeGreaterThan(0);
    });

    it('should return cached data on second call (no API call)', async () => {
      let apiCallCount = 0;

      // Setup nock to ONLY intercept once - second call should use cache and not hit nock
      const scope = nock('http://localhost:4000')
        .get('/api/v1/flights/search')
        .query(apiQuery)
        .times(1) // Only allow ONE call
        .reply(200, () => {
          apiCallCount++;
          return mockApiResponse;
        }).persist();

      // First call - should call external API and cache result
      const res1 = await request(testContext!.app.getHttpServer())
        .get('/api/v1/search/flights')
        .query(apiQuery)
        .expect(200);

      expect(scope.isDone()).toBe(true);
      expect(apiCallCount).toBe(1);

      // // Extract guestId from first response to reuse in second call
      const cookies = res1.headers['set-cookie'];
      const cookiesArray = Array.isArray(cookies) ? cookies : [cookies].filter(Boolean);
      const guestIdCookie = cookiesArray.find((cookie: string) => cookie.startsWith('guestId='));
      const guestIdValue = (guestIdCookie.match(/guestId=([^;]+)/) || [])[1];

      // Verify data is cached
      const redisClient = testContext!.redisService.getClient();
      const keys = await redisClient.keys('*search-flights*');
      expect(keys.length).toBeGreaterThan(0);

      // Second call - should use cache (include the same guestId cookie)
      const res2 = await request(testContext!.app.getHttpServer())
        .get('/api/v1/search/flights')
        .set('Cookie', [`guestId=${guestIdValue}`])
        .query(apiQuery)
        .expect(200);

      // External API should still only be called once
      expect(apiCallCount).toBe(1);

      expect(res2.body.data).toEqual(res1.body.data);
    });


    it('should handle external API errors gracefully', async () => {
      const redisClient = testContext!.redisService.getClient();

      const scope = nock('http://localhost:4000')
        .get('/api/v1/flights/search')
        .query(apiQuery)
        .reply(500, { error: 'API Error' });

      await request(testContext!.app.getHttpServer())
        .get('/api/v1/search/flights')
        .query(apiQuery)
        .expect(500);

      expect(scope.isDone()).toBe(true);

      // Verify nothing was cached on error using RedisService
      const keys = await redisClient.keys('*search-flights*');
      expect(keys).toHaveLength(0);
    });
  });


});