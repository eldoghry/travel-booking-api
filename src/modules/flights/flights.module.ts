import { Module } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { FlightProviderManager } from './providers/flight-provider.manager';
import { AmadeusFlightProvider } from './providers/amadeus-flight.provider';
import { FlightProviderFactory } from './providers/flight-provider.factory';
import { AmadeusModule } from '../../common/amadeus/amadeus.module';

@Module({
  controllers: [FlightsController],
  providers: [FlightsService, FlightProviderManager, AmadeusFlightProvider, FlightProviderFactory],
  imports: [AmadeusModule],
})
export class FlightsModule {}
