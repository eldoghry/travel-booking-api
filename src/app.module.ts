import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ENV_CONFIG, THROTTLE_CONFIG } from './config';

@Module({
  imports: [
    ConfigModule.forRoot(ENV_CONFIG),
    ThrottlerModule.forRoot(THROTTLE_CONFIG),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
