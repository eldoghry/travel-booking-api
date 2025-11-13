import { NestFactory } from '@nestjs/core';
import { ConsumeMessage } from 'amqplib';
import { AppModule } from '../app.module';
import { RabbitMQQueue } from '../modules/rabbitmq/rabbitmq.enum';
import { RabbitMQService } from '../modules/rabbitmq/rabbitmq.service';
import { EmailService } from '../modules/notification/channels/email.service';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const rabbitmq = appContext.get(RabbitMQService);
  const emailService = appContext.get(EmailService);

  rabbitmq.consume(
    RabbitMQQueue.EMAIL_TASKS,
    async (msg: ConsumeMessage) => {
      if (!msg) return;

      try {
        const payload = JSON.parse(msg.content.toString());
        console.log(`📧 Received Email task: ${JSON.stringify(payload)}`);

        const to = payload.to;
        const subject = payload.subject;
        const template = payload.template;
        const context = payload.context;

        if (Math.random() < 0.3) throw new Error('Random failure');

        await new Promise((resolve) => setTimeout(resolve, 2000));
        await emailService.send(template, {
          to,
          subject,
          context,
        });
        rabbitmq.ack(msg);
      } catch (error) {
        console.error(`❌ Email send error`);
        rabbitmq.nack(msg, false, true);
      }
    },
    5, //prefetch 5 message
  );

  console.log('⚙️ Email worker is running ...');
}

bootstrap();
