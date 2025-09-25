import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import {
  ENV_CONFIG,
  THROTTLE_CONFIG,
  TYPEORM_CONFIG,
  CACHE_CONFIG,
} from './config';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(ENV_CONFIG),
    ThrottlerModule.forRoot(THROTTLE_CONFIG),
    TypeOrmModule.forRootAsync(TYPEORM_CONFIG),
    CacheModule.registerAsync(CACHE_CONFIG),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
