import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RedisService } from '../../common/redis/redis.service';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { SearchFlightCriteriaDto } from './dto/search-flight-criteria.dto';
import { SearchHotelCriteriaDto } from './dto/search-hotel-criteria.dto';

@Injectable()
export class SearchCacheService {
  private readonly logger = new Logger(SearchCacheService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly httpService: HttpService,
  ) { }

  private generateCacheKey(prefix: string, criteria: SearchFlightCriteriaDto | SearchHotelCriteriaDto, customerId: string) {
    const raw = JSON.stringify({ customerId, criteria });
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return `${prefix}:${hash}`;
  }

  async searchWithCache(prefix: string, criteria: SearchFlightCriteriaDto | SearchHotelCriteriaDto, customerId: string, apiUrl: string) {
    const cacheKey = this.generateCacheKey(prefix, criteria, customerId);

    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      this.logger.log(`Cache hit: ${cacheKey}`);
      return cached;
    }
    this.logger.log(`Cache miss: ${cacheKey} — calling ${apiUrl}`);
    const { data } = await firstValueFrom(this.httpService.get(apiUrl, { params: criteria }));

    await this.redisService.set(cacheKey, data, 10 * 60); // 10 min 
    this.logger.log(`Cached response for ${cacheKey}`);
    return data;
  }
}
