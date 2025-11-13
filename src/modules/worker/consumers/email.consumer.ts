import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { RabbitMQService } from 'src/modules/rabbitmq/rabbitmq.service';

@Injectable()
export class EmailConsumer implements OnModuleInit {
  constructor(private readonly rabbitMQ: RabbitMQService) {}

  onModuleInit() {
    this.rabbitMQ.consume(
      'notification_tasks',
      async (msg: ConsumeMessage) => {
        if (!msg) return;

        try {
          const payload = JSON.parse(msg.content.toString());

          await new Promise((r) => setTimeout(r, 2000));

          if (Math.random() < 0.3) throw new Error('Random failure');

          console.log(`✉️ Sending email to: ${payload.email}`);

          this.rabbitMQ.ack(msg);
        } catch (error) {
          console.error('❌ Failed to process message:', error);
          this.rabbitMQ.nack(msg, false, true); // Requeue message
        }
      },
      5,
    );

    console.log('EmailConsumer is listening for messages...');
  }
}
