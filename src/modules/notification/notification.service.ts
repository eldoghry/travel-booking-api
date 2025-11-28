import { RabbitMQService } from 'src/modules/rabbitmq/rabbitmq.service';
import { Injectable } from '@nestjs/common';
import { RabbitMQQueue } from '../rabbitmq/rabbitmq.enum';

@Injectable()
export class NotificationService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async sendSMS(to: string, body: string) {
    await this.rabbitMQService.sendToQueue(RabbitMQQueue.SMS_TASKS, { to, body });
  }

  async sendEmail(to: string, subject: string, template: string, context: Record<string, any>) {
    await this.rabbitMQService.sendToQueue(RabbitMQQueue.EMAIL_TASKS, {
      to,
      subject,
      template,
      context,
    });
  }
}
