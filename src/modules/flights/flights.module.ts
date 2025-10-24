import { Module } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { FlightsController } from './flights.controller';
import { FlightProviderManager } from './providers/flight-provider.manager';

@Module({
  controllers: [FlightsController],
  providers: [FlightsService, FlightProviderManager],
})
export class FlightsModule {}
