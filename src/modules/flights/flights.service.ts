import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { FlightProviderManager } from './providers/flight-provider.manager';
import { FlightSearchDto, FlightSearchResponseDto } from './dto/flight-search.dto';
import { FlightBookingDto, FlightBookingResponseDto } from './dto/flight-book.dto';
import { FlightDetailsDto, FlightDetailsResponseDto } from './dto/flight-details.dto';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class FlightsService {
  private ttl = 6000;

  constructor(
    private readonly flightProviderManager: FlightProviderManager,
    private readonly redisService: RedisService,
  ) {}

  private _generateCacheKey(prefix: string, provider: string, id: string): string {
    return `flight:${prefix}:${provider}:${id}`;
  }

  // TODO: define dtos response
  async searchFlights(dto: FlightSearchDto): Promise<FlightSearchResponseDto> {
    const provider = await this.flightProviderManager.getProvider();
    console.log(`🔍 Searching flights with provider: ${provider.providerName}`);

    const data = await provider.searchFlights(dto);
    const searchId = crypto.randomUUID();
    const cacheKey = this._generateCacheKey('search', provider.providerName, searchId);

    await this.redisService.set(cacheKey, JSON.stringify(data), this.ttl);

    return {
      searchId,
      provider: provider.providerName,
      data, // todo: reformat data
    };
  }

  // TODO: define dto response
  async getFlightDetails(dto: FlightDetailsDto): Promise<FlightDetailsResponseDto> {
    const provider = await this.flightProviderManager.getProvider(dto.provider);

    const flightOffer = await this._extractFlightSearchDataFromCache(
      provider.providerName,
      dto.searchId,
      dto.flightId,
    );

    const result = await provider.getFlightDetails(flightOffer);

    const offerPriceId = crypto.randomUUID();
    const cacheKey = this._generateCacheKey('price', provider.providerName, offerPriceId);
    await this.redisService.set(cacheKey, JSON.stringify(result), this.ttl);

    return {
      searchId: dto.searchId,
      offerPriceId,
      offerId: dto.flightId,
      provider: provider.providerName,
      data: result,
    };
  }

  // TODO: define dtos request & response
  async bookFlight(dto: FlightBookingDto): Promise<FlightBookingResponseDto> {
    const provider = await this.flightProviderManager.getProvider(dto.provider);

    const offerPriceData = await this._extractFlightPriceDataFromCache(
      dto.provider,
      dto.flightId,
      dto.offerPriceId,
    );

    return provider.bookFlight({
      ...offerPriceData,
      travelers: dto.travelers.map((item, index) => ({ id: index + 1, ...item })),
    });
  }

  private async _extractFlightSearchDataFromCache(
    providerName: string,
    searchId: string,
    flightOfferId: string,
  ) {
    const cacheKey = this._generateCacheKey('search', providerName, searchId);
    const cachedData = (await this.redisService.get(cacheKey)) as string;

    if (!cachedData) throw new BadRequestException('Invalid or expired search ID');

    const flightDetails = JSON.parse(cachedData);

    const flightOffer = flightDetails.data.find((item: any) => item.id === flightOfferId);

    if (!flightOffer) throw new BadRequestException('Invalid flight ID');

    return flightOffer;
  }

  private async _extractFlightPriceDataFromCache(
    providerName: string,
    flightId: string,
    offerPriceId: string,
  ) {
    const cacheKey = this._generateCacheKey('price', providerName, offerPriceId);
    const cachedData = (await this.redisService.get(cacheKey)) as string;

    if (!cachedData) throw new BadRequestException('Invalid or expired offer price ID');

    const flightDetails = JSON.parse(cachedData);

    const flightPriceOffer = flightDetails.data.flightOffers.find(
      (item: any) => item.id === flightId,
    );

    if (!flightPriceOffer) throw new BadRequestException('Invalid flight ID');

    return flightPriceOffer;
  }
}
