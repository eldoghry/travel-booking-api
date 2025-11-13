import { NotificationEvent } from './modules/notification/enum/notification-event.enum';
import { RabbitMQService } from './modules/rabbitmq/rabbitmq.service';
import {
  BadRequestException,
  Controller,
  Get,
  LoggerService,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser, Roles, Unprotected } from 'nest-keycloak-connect';
import { KeycloakAuthSyncInterceptor } from './modules/auth/interceptors/keycloak-auth.interceptor';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get('public')
  @Unprotected()
  async getHello() {
    return this.appService.getHello();
  }

  @Get('protected')
  @UseInterceptors(KeycloakAuthSyncInterceptor)
  getUserProfile(@CurrentUser() user: any) {
    return {
      message: 'User Profile',
      user,
    };
  }

  @Get('admin')
  @Roles({ roles: ['admin'] })
  welcomeAdmin(@AuthenticatedUser() user: any) {
    return {
      message: 'welcome admin',
      user,
    };
  }

  @Get('profile')
  getUserProfile1(@AuthenticatedUser() user: any) {
    return {
      message: 'User Profile',
      user,
    };
  }

  @Get('notifications')
  @Unprotected()
  mockSendingNotifications() {
    for (let index = 0; index < 10; index++) {
      // sending user.registered
      const x = this.eventEmitter.emit(NotificationEvent.USER_REGISTERED, {
        email: `user${index}@example.com`,
        name: `User ${index}`,
      });

      console.log(`📨 Emitted USER_REGISTERED event: [${index}]`, x);

      // sending forget.password
      const y = this.eventEmitter.emit(NotificationEvent.FORGET_PASSWORD, {
        email: `user${index}@example.com`,
        name: `User ${index}`,
        resetToken: `reset-token-${index}`,
      });

      console.log(`📨 Emitted FORGET_PASSWORD event: [${index}]`, y);

      // sending payment.success
      const z = this.eventEmitter.emit(NotificationEvent.PAYMENT_SUCCESS, {
        paymentId: `payment-${index}`,
        amount: 100 + index,
        name: `User ${index}`,
        email: `user${index}@example.com`,
        phone: `+1234567890${index}`,
      });

      console.log(`📨 Emitted PAYMENT_SUCCESS event: [${index}]`, z);
    }
  }
}
