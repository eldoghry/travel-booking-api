import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { FlightProviderManager } from './providers/flight-provider.manager';
import { FlightSearchDto, FlightSearchResponseDto } from './dto/flight-search.dto';
import { FlightBookingDto, FlightBookingResponseDto } from './dto/flight-book.dto';
import { FlightDetailsDto, FlightDetailsResponseDto } from './dto/flight-details.dto';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class FlightsService {
  constructor(
    private readonly flightProviderManager: FlightProviderManager,
    private readonly redisService: RedisService,
  ) {}

  private generateCacheKey(prefix: string, provider: string, id: string): string {
    return `flight:${prefix}:${provider}:${id}`;
  }

  // TODO: define dtos request & response
  async searchFlights(dto: FlightSearchDto): Promise<FlightSearchResponseDto> {
    const provider = await this.flightProviderManager.getProvider();
    console.log(`🔍 Searching flights with provider: ${provider.providerName}`);

    const data = await provider.searchFlights(dto);
    const searchId = crypto.randomUUID();
    const cacheKey = this.generateCacheKey('search', provider.providerName, searchId);

    await this.redisService.set(cacheKey, JSON.stringify(data), 600);

    return {
      searchId,
      provider: provider.providerName,
      data, // todo: reformat data
    };
  }

  // TODO: define dtos request & response
  async getFlightDetails(dto: FlightDetailsDto): Promise<FlightDetailsResponseDto> {
    const provider = await this.flightProviderManager.getProvider(dto.provider);

    const cacheKey = this.generateCacheKey('search', dto.provider, dto.searchId);
    const cachedData = (await this.redisService.get(cacheKey)) as string;

    if (!cachedData) throw new BadRequestException('Invalid or expired search ID');

    const flightDetails = JSON.parse(cachedData);

    const flight = flightDetails.data.find((item: any) => item.id === dto.flightId);

    if (!flight) throw new BadRequestException('Invalid flight ID');

    return provider.getFlightDetails(flight);
  }

  // TODO: define dtos request & response
  async bookFlight(dto: FlightBookingDto): Promise<FlightBookingResponseDto> {
    const provider = await this.flightProviderManager.getProvider();
    return provider.bookFlight(dto);
  }
}
