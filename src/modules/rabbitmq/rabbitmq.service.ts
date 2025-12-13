import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  AmqpConnectionManager,
  Channel,
  ChannelWrapper,
  connect as amqpConnect,
} from 'amqp-connection-manager';
import { ConsumeMessage } from 'amqplib';
import { RabbitMQQueue } from './rabbitmq.enum';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: AmqpConnectionManager;
  private channel: ChannelWrapper;
  private readonly queueNames = Object.values(RabbitMQQueue) as string[];

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const RABBIT_MQ_URI = this.configService.get<string>('RABBIT_MQ_URI') as string;
    this.connection = amqpConnect([RABBIT_MQ_URI]);
    this.channel = this.connection.createChannel({
      // json: true,
      setup: async (channel: Channel) => {
        await channel.assertExchange('booking', 'topic', {
          durable: true,
        });

        await channel.assertExchange('booking.dlx', 'topic', {
          durable: true,
        });

        this.queueNames.forEach(async (queue) => {
          await channel.assertQueue(queue, { durable: true });
        });
      },
    });

    this.connection.on('connect', () => console.log('Connected to RabbitMQ'));
    this.connection.on('disconnect', (err) => console.error('Disconnected from RabbitMQ', err));
    this.connection.on('connectFailed', (err) =>
      console.error('Connect Failed from RabbitMQ', err),
    );
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }

  async sendToQueue(queue: string, message: any) {
    await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
  }

  async consume(
    queue: string,
    callback: (msg: ConsumeMessage) => void,
    prefetch = 1,
    options?: {
      exchange: string;
      routingKey: string;
    },
  ) {
    await this.channel.addSetup(async (channel) => {
      await channel.prefetch(prefetch);
      await channel.consume(queue, callback);
    });
  }

  async ack(message: ConsumeMessage) {
    this.channel.ack(message);
  }

  async nack(message: ConsumeMessage, allUpTo: boolean = false, requeue: boolean = false) {
    this.channel.nack(message, allUpTo, requeue);
  }

  async publish(exchange: string, routingKey: string, payload: any) {
    await this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });
  }

  async subscribe<T>(
    options: {
      queue: string;
      exchange: string;
      routingKey: string;
      prefetch?: number;
      deadLetterExchange?: string;
    },
    handler: (data: T, raw: ConsumeMessage) => Promise<void>,
  ) {
    await this.channel.addSetup(async (channel: Channel) => {
      await channel.assertQueue(options.queue, {
        durable: true,
        deadLetterExchange: options.deadLetterExchange ?? undefined,
      });

      await channel.bindQueue(options.queue, options.exchange, options.routingKey);

      await channel.prefetch(options.prefetch ?? 1);

      await channel.consume(options.queue, async (msg) => {
        if (!msg) return;

        try {
          const data = JSON.parse(msg.content.toString());
          await handler(data, msg);
          channel.ack(msg);
        } catch (err) {
          console.error('RabbitMQ handler error', err);
          channel.nack(msg, false, false);
        }
      });
    });
  }
}
