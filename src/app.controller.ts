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
  constructor(private readonly appService: AppService) {}

  @Get('public')
  @Unprotected()
  getHello(): string {
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
