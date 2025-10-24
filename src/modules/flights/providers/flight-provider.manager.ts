import { Injectable, Logger } from '@nestjs/common';
import { FlightProvider } from '../interfaces/flight-provider.interface';
import { FlightProviderFactory } from './flight-provider.factory';

@Injectable()
export class FlightProviderManager {
  private currentProvider: FlightProvider;
  private lastProviderName: string;
  private readonly logger = new Logger(FlightProviderManager.name);

  constructor() {
    // Initialize the current provider and last provider name
  }

  async getProvider(): Promise<FlightProvider> {
    const providerName = 'amadeus'; // TODO: later take it from config | database | cache

    if (!this.currentProvider || this.lastProviderName !== providerName) {
      this.currentProvider = FlightProviderFactory.createProvider(providerName);
      this.lastProviderName = providerName;
      this.logger.log(`✈️ Switched flight provider to: ${providerName}`);
    }

    return this.currentProvider;
  }
}
