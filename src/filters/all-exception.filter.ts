import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { Response, Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode: string | number | undefined;

    // 🧱 Handle HTTP Exceptions (e.g. throw new HttpException(...))
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || message;

      // 🧱 Handle TypeORM Query Errors
    } else if (exception instanceof QueryFailedError) {
      const err = exception as any;
      status = HttpStatus.BAD_REQUEST;

      // PostgreSQL errors
      errorCode = err.code;
      switch (err.code) {
        case '23505':
          message = 'Duplicate entry';
          break;
        case '23503':
          message = 'Foreign key constraint violation';
          break;
        case '23502':
          message = 'Missing required field (NOT NULL constraint)';
          break;
        default:
          message = err.message;
          break;
      }

      // 🧱 Fallback for all other errors
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log for debugging / auditing
    // this.logger.error(message, (exception as any)?.stack);
     this.logger.error({
      context: AllExceptionsFilter.name,
      level: 'error',
      message,
      path: request.url,
      errorCode,
      stack: (exception as any)?.stack,
      timestamp: new Date().toISOString(),
    });

    // Send formatted JSON response
    response.status(status).json({
      statusCode: status,
      message,
      errorCode,
      timestamp: new Date().toISOString(),
    });
  }
}
