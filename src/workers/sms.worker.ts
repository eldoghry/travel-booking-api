import { NestFactory } from '@nestjs/core';
import { ConsumeMessage } from 'amqplib';
import { AppModule } from '../app.module';
import { SmsService } from '../modules/notification/channels/sms.service';
import { RabbitMQQueue } from '../modules/rabbitmq/rabbitmq.enum';
import { RabbitMQService } from '../modules/rabbitmq/rabbitmq.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const rabbitmq = appContext.get(RabbitMQService);
  const smsService = appContext.get(SmsService);

  rabbitmq.consume(
    RabbitMQQueue.SMS_TASKS,
    async (msg: ConsumeMessage) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        console.log(`📨 Received SMS task: ${JSON.stringify(payload)}`);

        const to = payload.to;
        const body = payload.body;

        if (Math.random() < 0.3) throw new Error('Random failure');

        await new Promise((resolve) => setTimeout(resolve, 2000));
        await smsService.send(to, body);
        rabbitmq.ack(msg);
      } catch (error) {
        console.error(`❌ SMS send error`);
        rabbitmq.nack(msg, false, true);
      }
    },
    3, //prefetch 3 message
  );

  console.log('⚙️ SMS worker is running ...');
}

bootstrap();
