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

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @Get('public')
  @Unprotected()
  async getHello() {
    for (let index = 0; index < 100; index++) {
      const payload = { id: index + 1, email: `user-${index + 1}@gmail.com` };
      await this.rabbitMQService.sendToQueue('notification_tasks', payload);
    }
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
}
