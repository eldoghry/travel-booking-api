import { Injectable } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationEvent } from './enum/notification-event.enum';

@Injectable()
export class NotificationListener {
  constructor(private readonly notificationService: NotificationService) {}

  @OnEvent(NotificationEvent.USER_REGISTERED)
  async handleUserRegistered(event: { email: string; name: string }) {
    await this.notificationService.sendEmail(
      event.email,
      'Welcome to Our App 💐',
      'welcome-template',
      { name: event.name, email: event.email, appUrl: 'https://myapp.com' },
    );
  }

  @OnEvent(NotificationEvent.FORGET_PASSWORD)
  async handleForgetPassword(event: { email: string; name: string; resetToken: string }) {
    await this.notificationService.sendEmail(
      event.email,
      'Password Reset Request 🔒',
      'forget-password-template',
      { name: event.name, resetToken: event.resetToken, appUrl: 'https://myapp.com' },
    );
  }

  @OnEvent(NotificationEvent.PAYMENT_SUCCESS)
  async handlePaymentSuccess(event: {
    paymentId: string;
    amount: number;
    name: string;
    email: string;
    phone: string;
  }) {
    await this.notificationService.sendEmail(
      event.email,
      'Payment Successful 💰',
      'payment-success-template',
      {
        name: event.name,
        amount: event.amount,
        paymentId: event.paymentId,
        appUrl: 'https://myapp.com',
      },
    );

    await this.notificationService.sendSMS(
      event.phone,
      `Your payment of $${event.amount} was successful! Payment ID: ${event.paymentId}`,
    );
  }
}
