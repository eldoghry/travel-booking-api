import { Test, TestingModule } from '@nestjs/testing';
import { SearchCacheService } from '../search-cache.service';
import { RedisService } from '../../../common/redis/redis.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { SearchFlightCriteriaDto } from '../dto/search-flight-criteria.dto';

// Mock RedisService
const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
};

// Mock HttpService
const mockHttpService = {
    get: jest.fn(),
};

const apiUrl = 'http://localhost:4000/api/v1/flights/search';
const prefix = 'search-flights';


describe('SearchCacheService', () => {
    let service: SearchCacheService;
    let redisService: RedisService;
    let httpService: HttpService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SearchCacheService,
                {
                    provide: RedisService,
                    useValue: mockRedisService,
                },
                {
                    provide: HttpService,
                    useValue: mockHttpService,
                },
            ],
        }).compile();

        service = module.get<SearchCacheService>(SearchCacheService);
        redisService = module.get<RedisService>(RedisService);
        httpService = module.get<HttpService>(HttpService);
        jest.clearAllMocks();
    });

    describe('generateCacheKey', () => {
        it('should generate consistent cache key for same input', () => {
            // Arrange
            const criteria: SearchFlightCriteriaDto = {
                origin: 'CAI',
                destination: 'JED',
                departureDate: new Date('2025-12-01'),
                adults: 2,
            };
            const customerId = 'user-123';

            // Act
            const key1 = (service as any).generateCacheKey('search-flights', criteria, customerId);
            const key2 = (service as any).generateCacheKey('search-flights', criteria, customerId);

            // Assert
            expect(key1).toBe(key2);
            expect(key1).toMatch(/^search-flights:[a-f0-9]{64}$/); // SHA256 hash format
        });

        it('should generate different cache keys for different criteria or different customer', () => {
            // Arrange
            const criteria1: SearchFlightCriteriaDto = {
                origin: 'CAI',
                destination: 'JED',
                departureDate: new Date('2025-12-01'),
                adults: 2,
            };
            const criteria2: SearchFlightCriteriaDto = {
                origin: 'CAI',
                destination: 'JED',
                departureDate: new Date('2025-12-01'),
                adults: 3, // Different number of adults
            };
            const customerId1 = 'user-123';
            const customerId2 = 'user-456';

            // Act
            const key1 = (service as any).generateCacheKey('search-flights', criteria1, customerId1);
            const key2 = (service as any).generateCacheKey('search-flights', criteria2, customerId1);
            const key3 = (service as any).generateCacheKey('search-flights', criteria1, customerId2);

            // Assert
            expect(key1).not.toBe(key2);
            expect(key1).not.toBe(key3);
        });
    });

    describe('searchWithCache', () => {
        it('should return cached data when available', async () => {
            // Arrange
            const criteria: SearchFlightCriteriaDto = {
                origin: 'CAI',
                destination: 'JED',
                departureDate: new Date('2025-12-01'),
                returnDate: new Date('2025-12-02'),
                adults: 2,
            };

            const customerId = 'user-123';

            const cachedData = {
                data: {
                    provider: "amadeus",
                    providerResult: {
                        meta: {
                            count: 1,
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
                                ],
                            },
                        ],
                    }
                },
            };

            mockRedisService.get.mockResolvedValue(cachedData);

            // Act
            const result = await service.searchWithCache(prefix, criteria, customerId, apiUrl);

            // Assert
            expect(redisService.get).toHaveBeenCalled();
            expect(httpService.get).not.toHaveBeenCalled(); // Should not call API
            expect(redisService.set).not.toHaveBeenCalled(); // Should not set cache again
            expect(result).toEqual(cachedData);
        });

        it('should call API and cache result when no cache exists', async () => {
            // Arrange
            const criteria: SearchFlightCriteriaDto = {
                origin: 'CAI',
                destination: 'JED',
                departureDate: new Date('2025-12-01'),
                adults: 2,
            };
            const customerId = 'user-123';

            const apiResponse = {
                data: {
                    provider: "amadeus",
                    providerResult: {
                        meta: {
                            count: 1,
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
                                ],
                            },
                        ],
                    }
                },
            };

            mockRedisService.get.mockResolvedValue(null); // Cache miss
            mockHttpService.get.mockReturnValue(of({ data: apiResponse })); // API returns data

            // Act
            const result = await service.searchWithCache(prefix, criteria, customerId, apiUrl);

            // Assert
            expect(redisService.get).toHaveBeenCalled();
            expect(httpService.get).toHaveBeenCalledWith(apiUrl, { params: criteria });
            expect(redisService.set).toHaveBeenCalledWith(
                expect.any(String), // Cache key
                apiResponse,
                10 * 60, // 10 minutes TTL
            );
            expect(result).toEqual(apiResponse);
        });

        it('should handle API errors gracefully', async () => {
            // Arrange
            const criteria: SearchFlightCriteriaDto = {
                origin: 'CAI',
                destination: 'JED',
                departureDate: new Date('2025-12-01'),
                adults: 2,
            };
            const customerId = 'user-123';

            mockRedisService.get.mockResolvedValue(null);

            mockHttpService.get.mockImplementation(() => throwError(() => new Error('API Error')));

            // Act & Assert
            await expect(
                service.searchWithCache(prefix, criteria, customerId, apiUrl),
            ).rejects.toThrow('API Error');

            expect(redisService.get).toHaveBeenCalled();
            expect(httpService.get).toHaveBeenCalledWith(apiUrl, { params: criteria });
            expect(redisService.set).not.toHaveBeenCalled();
        });
    });
});