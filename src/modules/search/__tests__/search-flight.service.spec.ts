import { Test, TestingModule } from '@nestjs/testing';
import { SearchFlightService } from '../search-flight.service';
import { SearchCacheService } from '../search-cache.service';
import { SearchFlightCriteriaDto } from '../dto/search-flight-criteria.dto';
import { FlightItemFormat } from '../interfaces/search-flight-response.interface';

// Mock SearchCacheService
const mockSearchCacheService = {
  searchWithCache: jest.fn(),
};

const mockCriteria: SearchFlightCriteriaDto = {
  origin: 'CAI',
  destination: 'JED',
  departureDate: '2025-12-01',
  returnDate: '2025-12-02',
  adults: 2,
  children: 1,
  infants: 0,
  travelClass: 'ECONOMY',
};

const mockApiResponse = {
  statusCode: 200,
  timestamp: "2025-11-06T07:21:48.019Z",
  path: "/api/v1/flights/search?origin=CAI&departureDate=2025-12-01&adults=2&destination=JED&limit=1&returnDate=2025-12-02&travelClass=economy&limit=1",
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
}

describe('SearchFlightService', () => {
  let service: SearchFlightService;
  let searchCacheService: SearchCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchFlightService,
        {
          provide: SearchCacheService,
          useValue: mockSearchCacheService,
        },
      ],
    }).compile();

    service = module.get<SearchFlightService>(SearchFlightService);
    searchCacheService = module.get<SearchCacheService>(SearchCacheService);
    jest.clearAllMocks();
  });

  describe('searchFlights', () => {
    it('should search flights and format results correctly', async () => {
      // Arrange
      const customerId = 'user-123';

      const expectedFormattedResult: FlightItemFormat = {
        id: "1",
        oneWay: false,
        availableSeats: 9,
        price: {
          currency: "EUR",
          total: "269.20",
          base: "40.00",
        },
        segments: [
          {
            departure: {
              iataCode: "CAI",
              terminal: "2",
              time: "2025-12-01T23:35:00",
            },
            arrival: {
              iataCode: "RUH",
              terminal: "4",
              time: "2025-12-02T03:10:00",
            },
            airline: {
              code: "SV",
              operatingCode: "SV",
            },
            flightNumber: "320",
            aircraft: "330",
            duration: "PT2H35M",
            stops: 0,
          },
          {
            departure: {
              iataCode: "RUH",
              terminal: "5",
              time: "2025-12-02T06:00:00",
            },
            arrival: {
              iataCode: "JED",
              terminal: "1",
              time: "2025-12-02T07:55:00",
            },
            airline: {
              code: "SV",
              operatingCode: "SV",
            },
            flightNumber: "1019",
            aircraft: "330",
            duration: "PT1H55M",
            stops: 0,
          },
        ],
      };

      process.env.BASE_URL = 'http://localhost:4000/api/v1';

      const apiUrl = 'http://localhost:4000/api/v1/flights/search';
      mockSearchCacheService.searchWithCache.mockResolvedValue(mockApiResponse); // Mock the searchWithCache method to return the mockApiResponse

      // Act
      const result = await service.searchFlights(mockCriteria, customerId);

      // Assert
      expect(searchCacheService.searchWithCache).toHaveBeenCalledWith(
        'search-flights',
        mockCriteria,
        customerId,
        apiUrl,
      );

      expect(result).toEqual({
        data: [expectedFormattedResult],
      });
    });

    it('should handle empty results from external API', async () => {
      // Arrange
      const mockCriteria: SearchFlightCriteriaDto = {
        origin: 'CAI',
        destination: 'JED',
        departureDate: '2025-11-01',
        adults: 1,
      };

      const mockApiResponse = {
        data: {
          providerResult: {
            data: [], // Empty results
          },
        },
      };

      mockSearchCacheService.searchWithCache.mockResolvedValue(mockApiResponse);

      // Act
      const result = await service.searchFlights(mockCriteria, 'user-123');

      // Assert
      expect(result).toEqual({ data: [] });
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const mockCriteria: SearchFlightCriteriaDto = {
        origin: 'CAI',
        destination: 'JED',
        departureDate: '2025-12-01',
        adults: 1,
      };

      mockSearchCacheService.searchWithCache.mockRejectedValue(
        new Error('API Error'),
      );

      // Act & Assert
      await expect(
        service.searchFlights(mockCriteria, 'user-123'),
      ).rejects.toThrow('API Error');
    });
  });
});