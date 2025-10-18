import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UsersService } from '../../../modules/users/users.service';

@Injectable()
export class KeycloakAuthSyncInterceptor implements NestInterceptor {
  constructor(private readonly userService: UsersService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
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
      request.user = user;
    }

    return next.handle();
  }
}
