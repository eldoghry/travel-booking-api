import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../../../modules/users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeycloakAuthSyncInterceptor implements NestInterceptor {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler<any>): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const keycloakUser = request.user;

    if (keycloakUser) {
      console.log('keycloakUser', keycloakUser);
      const keycloakId = keycloakUser.sub;

      let user = await this.userService.findByKeycloakId(keycloakId);

      if (!user) {
        user = await this.userService.createFromKeycloak(keycloakUser);
      }

      // add roles
      const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID') as string;

      const roles = keycloakUser.realm_access?.roles || [];
      roles.push(...(keycloakUser.resource_access?.[clientId]?.roles || []));
      request.user = { ...user, roles };
    }

    return next.handle();
  }
}
