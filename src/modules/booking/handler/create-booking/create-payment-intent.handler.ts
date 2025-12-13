import { FlightsService } from '../../../flights/flights.service';
import { CommandHandler } from '../../../../common/abstract/command-handler.abstract';
import { CreateBookingContext } from '../handler.interface';
import { PaymentService } from 'src/modules/payment/services/payment.service';
import { BookingType } from 'src/modules/transaction/enums/transaction.enum';

export class CreatePaymentLinkIntentHandler extends CommandHandler<CreateBookingContext> {
  constructor(private readonly paymentService: PaymentService) {
    super();
  }

  async execute(context: CreateBookingContext): Promise<CreateBookingContext> {
    const paymentIntent = await this.paymentService.initiatePayment({
      bookingId: context?.savedBooking?.id as number,
      bookingType: BookingType.Flight,
      currency: context?.flightSummary?.price?.currency,
      amount: context?.flightSummary?.price?.total,
      customerId: context.user.id,
      provider: context.bookingRequestDto.paymentMethod,
      paymentMethodId: 1,
    });

    context.paymentIntentLink = paymentIntent.approvalUrl;

    return context;
  }
}
