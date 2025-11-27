import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationListener } from './notification.listener';
import { EmailNotificationConsumer } from './consumers/email.consumer';
import { WorkerPoolModule } from '../worker-pool/worker-pool.module';
import { SmsNotificationConsumer } from './consumers/sms.consumer';

@Module({
  providers: [
    NotificationService,
    NotificationListener,
    EmailNotificationConsumer,
    SmsNotificationConsumer,
  ],
  exports: [NotificationService, NotificationListener],
  imports: [WorkerPoolModule],
})
export class NotificationModule {}
