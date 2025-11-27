import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { RabbitMQQueue } from 'src/modules/rabbitmq/rabbitmq.enum';
import { RabbitMQService } from 'src/modules/rabbitmq/rabbitmq.service';
import { WorkerPoolType } from 'src/modules/worker-pool/pools/worker-pool.interface';
import { WorkerPoolRouter } from 'src/modules/worker-pool/pools/worker-pool.router';

@Injectable()
export class SmsNotificationConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly workerPoolRouter: WorkerPoolRouter,
  ) {}

  onModuleInit() {
    this.rabbitmq.consume(
      RabbitMQQueue.SMS_TASKS,
      async (msg: ConsumeMessage) => {
        if (!msg) return;

        try {
          const payload = JSON.parse(msg.content.toString());

          const to = payload.to;
          const body = payload.body;

          const smsPayload = { to, body };

          //   if (Math.random() < 0.3) throw new Error('Random failure');
          //   await new Promise((resolve) => setTimeout(resolve, 2000));

          // add task to sms worker to be send later
          const result = await this.workerPoolRouter.addTaskToWorkerPool(
            WorkerPoolType.SMS,
            smsPayload,
          );

          if (result.status === 'sent') {
            this.rabbitmq.ack(msg);
            console.log(`✅ (SMS Consumer): SMS sent successfully for task ${result.job.taskId}`);
          }
        } catch (error) {
          console.error(`❌ (SMS Consumer): SMS send error`, error);
          this.rabbitmq.nack(msg, false, true);
        }
      },
      10, //prefetch 5 message
    );

    console.log('⚙️  SMS Consumer is running ...');
  }
}
