import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseFormat<T = any> {
  statusCode: number;
  timestamp: string;
  path: string;
  data?: T;
  meta?: Record<string, any>; // optional meta/pagination info
}

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<T, ResponseFormat<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseFormat<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((result) => {
        // If controller already returned a structure like { data, meta, statusCode }
        if (result && result.statusCode) {
          return result;
        }

        return {
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
          data: result?.data ?? result,
          meta: result?.meta ?? undefined,
        };
      }),
    );
  }
}
