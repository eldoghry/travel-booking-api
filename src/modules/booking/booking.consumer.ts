import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { BookingService } from './booking.service';
import { BookingType } from '../transaction/enums/transaction.enum';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { ProcessBookingDto } from './dto/process-booking.dto';

@Injectable()
export class BookingConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitMQ: RabbitMQService,
    private readonly bookingService: BookingService,
  ) {}

  async onModuleInit() {
    await this.rabbitMQ.subscribe(
      {
        queue: 'booking.confirm.queue',
        exchange: 'booking',
        routingKey: 'booking.confirm',
      },
      async (payload: ProcessBookingDto) => {
        await this.bookingService.confirmBooking(payload);
      },
    );

    await this.rabbitMQ.subscribe(
      {
        queue: 'booking.cancel.queue',
        exchange: 'booking',
        routingKey: 'booking.cancel',
      },
      async (payload: CancelBookingDto) => {
        await this.bookingService.cancelBooking(payload);
      },
    );
  }
}
