import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { NotificationListener } from './notification.listener';

@Module({
  providers: [NotificationService, NotificationListener, SmsService, EmailService],
  exports: [NotificationService, NotificationListener, SmsService, EmailService],
})
export class NotificationModule {}
