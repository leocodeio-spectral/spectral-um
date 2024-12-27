import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../domain.exception';
import { LoggerService } from '../../../utils/logging/logger.service';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('DomainExceptionFilter');
  }

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = HttpStatus.BAD_REQUEST;

    this.logger.error(`Domain Exception: ${exception.message}`, exception.stack);

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: 'Domain Error',
      timestamp: new Date().toISOString(),
    });
  }
} 