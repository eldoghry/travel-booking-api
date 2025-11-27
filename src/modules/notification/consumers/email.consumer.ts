import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { RabbitMQQueue } from 'src/modules/rabbitmq/rabbitmq.enum';
import { RabbitMQService } from 'src/modules/rabbitmq/rabbitmq.service';
import { WorkerPoolType } from 'src/modules/worker-pool/pools/worker-pool.interface';
import { WorkerPoolRouter } from 'src/modules/worker-pool/pools/worker-pool.router';

@Injectable()
export class EmailNotificationConsumer implements OnModuleInit {
  constructor(
    private readonly rabbitmq: RabbitMQService,
    private readonly workerPoolRouter: WorkerPoolRouter,
    // private readonly emailService: EmailService,
  ) {}

  onModuleInit() {
    this.rabbitmq.consume(
      RabbitMQQueue.EMAIL_TASKS,
      async (msg: ConsumeMessage) => {
        if (!msg) return;

        try {
          const payload = JSON.parse(msg.content.toString());
          //   console.log(`📧 Received Email task: ${JSON.stringify(payload)}`);

          const to = payload.to;
          const subject = payload.subject;
          const template = payload.template;
          const context = payload.context;

          const emailPayload = { to, subject, template, context };

          //   if (Math.random() < 0.3) throw new Error('Random failure');
          //   await new Promise((resolve) => setTimeout(resolve, 2000));

          // add task to email worker to be send later
          const result = await this.workerPoolRouter.addTaskToWorkerPool(
            WorkerPoolType.EMAIL,
            emailPayload,
          );

          if (result.status === 'sent') {
            this.rabbitmq.ack(msg);
            console.log(
              `✅ (Email Consumer): Email sent successfully for task ${result.job.taskId}`,
            );
          }
        } catch (error) {
          console.error(`❌ (Email Consumer): Email send error`, error);
          this.rabbitmq.nack(msg, false, true);
        }
      },
      10, //prefetch 5 message
    );

    console.log('⚙️  Email Consumer is running ...');
  }
}
