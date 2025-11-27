import { Injectable, Logger } from '@nestjs/common';
import { HotelProvider } from '../interfaces/hotel-provider.interface';
import { HotelProviderFactory } from './hotel-provider.factory';

@Injectable()
export class HotelProviderManager {
  private currentProvider: HotelProvider;
  private lastProviderName: string;
  private readonly logger = new Logger(HotelProviderManager.name);

  constructor(private readonly hotelProviderFactory: HotelProviderFactory) {}

  async getProvider(providerName: string = 'amadeus'): Promise<HotelProvider> {
    if (!this.currentProvider || this.lastProviderName !== providerName) {
      this.currentProvider = this.hotelProviderFactory.createProvider(providerName);
      this.lastProviderName = providerName;
      this.logger.log(`🏨  Switched hotel provider to: ${providerName}`);
    }

    return this.currentProvider;
  }
}
