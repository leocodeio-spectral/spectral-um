import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { ApplicationException } from '../application.exception';
import { LoggerService } from '../../../utils/logging/logger.service';
import { ResponseService } from '../../services/response.service';

@Catch(ApplicationException)
export class ApplicationExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly logger: LoggerService,
    private readonly responseService: ResponseService,
  ) {
    this.logger.setContext('ApplicationExceptionFilter');
  }

  catch(exception: ApplicationException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    this.logger.error(`Application Exception: ${exception.message}`, exception.stack);

    const errorResponse = this.responseService.error(
      exception.message,
      status,
    );

    response.status(status).json(errorResponse);
  }
} 