import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestContext } from '../contexts/request-context';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    const store = {
      userId: user?.sub ?? null,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      requestId: req.headers['x-request-id'] || crypto.randomUUID(),
    };

    return new Observable((observer) => {
      RequestContext.run(store, () => next.handle().subscribe(observer));
    });
  }

}
