
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

// This logging interceptor captures HTTP request/response lifecycle at the business logic level.

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const now = Date.now();

    this.logger.log(`➡️  ${method} ${url} request started`);

    return next.handle().pipe(
      tap(() => this.logger.log(`⬅️  ${method} ${url} finished in ${Date.now() - now}ms`)),
    );
  }
}