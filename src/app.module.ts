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
  KEYCLOAK_OPTIONS,
} from './config';
import { UsersModule } from './modules/users/users.module';
import { KeycloakConnectModule, AuthGuard, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { KeycloakAuthSyncInterceptor } from './modules/auth/interceptors/keycloak-auth.interceptor';
import { FlightsModule } from './modules/flights/flights.module';
import { AxiosModule } from './common/axios/axios.module';
import { AmadeusModule } from './common/amadeus/amadeus.module';

@Module({
  imports: [
    ConfigModule.forRoot(ENV_CONFIG),
    ThrottlerModule.forRoot(THROTTLE_CONFIG),
    TypeOrmModule.forRootAsync(TYPEORM_CONFIG),
    CacheModule.registerAsync(CACHE_CONFIG),
    KeycloakConnectModule.registerAsync(KEYCLOAK_OPTIONS),
    UsersModule,
    AuthModule,
    FlightsModule,
    AxiosModule,
    AmadeusModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // 🔒 Guards for keycloak
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },

    // 🔁 Interceptor for user sync
    {
      provide: APP_INTERCEPTOR,
      useClass: KeycloakAuthSyncInterceptor,
    },
  ],
})
export class AppModule {}
