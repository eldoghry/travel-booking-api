import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class QueryExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(QueryExceptionFilter.name);

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const err: any = exception;
    let message = 'Database query error';
    let status = HttpStatus.BAD_REQUEST;

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
      case '22P02':
        message = 'Invalid input syntax';
        break;
      default:
        message = err.message;
    }

    this.logger.error(`[Query Exception]: ${message}`, err.stack);

    response.status(status).json({
      statusCode: status,
      message,
      errorCode: err.code,
      timestamp: new Date().toISOString(),
    });
  }
}
