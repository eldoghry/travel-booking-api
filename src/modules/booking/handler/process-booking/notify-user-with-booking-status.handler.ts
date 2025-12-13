import { CommandHandler } from '../../../../common/abstract/command-handler.abstract';
import { CreateBookingContext, ProcessBookingOnProviderContext } from '../handler.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from 'src/modules/notification/enum/notification-event.enum';
import { BookingType } from 'src/modules/transaction/enums/transaction.enum';

export class NotifyUserWithBookingStatus extends CommandHandler<ProcessBookingOnProviderContext> {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async execute(
    context: ProcessBookingOnProviderContext,
  ): Promise<ProcessBookingOnProviderContext> {
    if (context.bookingStatus !== 'pending') {
      let notificationEvent: NotificationEvent =
        context.bookingStatus === 'success'
          ? NotificationEvent.BOOKING_CONFIRMED
          : NotificationEvent.BOOKING_CANCELED;

      const payload = {
        email: context.bookingDB.user.email,
        bookingReference: context.bookingDB.referenceNumber,
        bookingType: BookingType.Flight,
      };

      this.eventEmitter.emit(notificationEvent, payload);
    }

    return context;
  }
}
