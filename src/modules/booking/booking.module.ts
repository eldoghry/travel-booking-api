import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { PaymentModule } from '../payment/payment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { FlightBooking } from './entities/flight-booking.entity';
import { FlightBookingController } from './controllers/flight-booking.controller';
import { FlightsModule } from '../flights/flights.module';
import { FlightBookingStatusLog } from './entities/flight-booking-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([FlightBooking, FlightBookingStatusLog]),
    PaymentModule,
    RabbitMQModule,
    FlightsModule,
  ],
  controllers: [FlightBookingController],
  providers: [BookingService],
})
export class BookingModule {}
