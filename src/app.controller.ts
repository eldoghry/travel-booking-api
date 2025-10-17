import { Controller, Get, LoggerService } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser, Roles, Unprotected } from 'nest-keycloak-connect';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('public')
  @Unprotected()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('protected')
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
}
