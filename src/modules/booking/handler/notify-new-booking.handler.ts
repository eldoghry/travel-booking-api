import { CommandHandler } from '../../../common/abstract/command-handler.abstract';
import { CreateBookingContext } from './handler.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotificationEvent } from 'src/modules/notification/enum/notification-event.enum';
import { BookingType } from 'src/modules/transaction/enums/transaction.enum';

export class NotifyUserWithNewBooking extends CommandHandler<CreateBookingContext> {
  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async execute(context: CreateBookingContext): Promise<CreateBookingContext> {
    this.eventEmitter.emit(NotificationEvent.BOOKING_CREATED, {
      email: context.user.email,
      bookingReference: context?.savedBooking?.referenceNumber,
      paymentLink: context.paymentIntentLink,
      bookingType: BookingType.Flight,
    });

    return context;
  }
}
