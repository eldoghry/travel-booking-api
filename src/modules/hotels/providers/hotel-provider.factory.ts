import { Injectable } from '@nestjs/common';
import { HotelProvider } from '../interfaces/hotel-provider.interface';
import { AmadeusHotelProvider } from './amadeus-hotel.provider';

@Injectable()
export class HotelProviderFactory {
  constructor(private readonly amadeusHotelProvider: AmadeusHotelProvider) {}

  createProvider(type: string): HotelProvider {
    switch (type) {
      case 'amadeus':
        return this.amadeusHotelProvider;
      default:
        throw new Error('Unknown hotel provider');
    }
  }
}
