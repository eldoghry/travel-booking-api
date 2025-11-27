import { Module } from '@nestjs/common';
import { HotelsController } from 'src/modules/hotels/hotels.controller';
import { HotelsService } from './hotels.service';
import { AmadeusModule } from 'src/common/amadeus/amadeus.module';
import { HotelProviderManager } from 'src/modules/hotels/providers/hotel-provider.manager';
import { HotelProviderFactory } from 'src/modules/hotels/providers/hotel-provider.factory';
import { AmadeusHotelProvider } from 'src/modules/hotels/providers/amadeus-hotel.provider';

@Module({
  imports: [AmadeusModule],
  controllers: [HotelsController],
  providers: [HotelsService, HotelProviderManager, HotelProviderFactory, AmadeusHotelProvider],
})
export class HotelsModule {}
