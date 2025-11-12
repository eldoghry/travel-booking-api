import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from '../search.controller';
import { SearchFlightService } from '../search-flight.service';
import { SearchFlightCriteriaDto } from '../dto/search-flight-criteria.dto';
import { SearchFlightResponse } from '../interfaces/search-flight-response.interface';
import { SearchHotelService } from '../search-hotel.service';

const mockSearchFlightService: Partial<Record<keyof SearchFlightService, jest.Mock>> = {
  searchFlights: jest.fn(),
};

const mockSearchHotelService: Partial<Record<keyof SearchHotelService, jest.Mock>> = {
  searchHotels: jest.fn(),
};

const mockCriteria: SearchFlightCriteriaDto = {
  origin: 'CAI',
  destination: 'JED',
  departureDate: new Date('2025-12-01'),
  adults: 2,
  children: 1,
  travelClass: 'ECONOMY',
};

const mockResult: SearchFlightResponse = {
  data: [
    {
      id: 'flight-1',
      oneWay: true,
      availableSeats: 5,
      price: { currency: 'USD', base: '200', total: '250' },
      segments: [],
    },
  ],
};

describe('SearchController', () => {
  let controller: SearchController;
  let searchFlightService: SearchFlightService;
  let searchHotelService: SearchHotelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchFlightService, useValue: mockSearchFlightService }, { provide: SearchHotelService, useValue: mockSearchHotelService }],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    searchFlightService = module.get<SearchFlightService>(SearchFlightService);
    jest.clearAllMocks();
  });

  describe('searchFlights', () => {
    it('should call searchFlights with user ID if authenticated', async () => {
      const mockRequest = { user: { id: 'user-123' }, cookies: {} };
      mockSearchFlightService.searchFlights!.mockResolvedValue(mockResult);

      const result = await controller.searchFlights(mockCriteria, mockRequest);

      expect(searchFlightService.searchFlights).toHaveBeenCalledWith(mockCriteria, 'user-123');
      expect(result).toEqual(mockResult);
    });

    it('should call searchFlights with guest ID if unauthenticated', async () => {
      const mockRequest = { user: null, cookies: { guestId: 'guest-456' } };
      mockSearchFlightService.searchFlights!.mockResolvedValue(mockResult);

      const result = await controller.searchFlights(mockCriteria, mockRequest);

      expect(searchFlightService.searchFlights).toHaveBeenCalledWith(mockCriteria, 'guest-456');
      expect(result).toEqual(mockResult);
    });

    it('should throw if service fails', async () => {
      mockSearchFlightService.searchFlights!.mockRejectedValue(new Error('Service error'));

      await expect(
        controller.searchFlights(mockCriteria, { user: { id: 'u1' }, cookies: {} }),
      ).rejects.toThrow('Service error');
    });
  });
});
