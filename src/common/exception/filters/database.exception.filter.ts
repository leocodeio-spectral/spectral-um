import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { LoggerService } from '../../../utils/logging/logger.service';

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('DatabaseExceptionFilter');
  }

  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(`Database Exception: ${exception.message}`, exception.stack);

    response.status(status).json({
      statusCode: status,
      message: 'Database operation failed',
      error: 'Database Error',
      timestamp: new Date().toISOString(),
    });
  }
} 