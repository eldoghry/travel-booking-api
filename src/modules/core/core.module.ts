import { Module } from '@nestjs/common';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import TYPEORM_CONFIG from 'src/config/typeorm.config';
import ENV_CONFIG from 'src/config/env.config';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from 'src/common/email/email.module';
import { SmsModule } from 'src/common/sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot(ENV_CONFIG),
    TypeOrmModule.forRootAsync(TYPEORM_CONFIG),
    RabbitMQModule,
    EmailModule,
    SmsModule,
  ],
  exports: [ConfigModule, TypeOrmModule, RabbitMQModule, EmailModule, SmsModule],
})
export class CoreModule {}
