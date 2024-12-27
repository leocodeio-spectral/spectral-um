import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from './logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();
    const requestBody = request.body;

    this.logger.log(
      `Incoming Request: ${method} ${url}`,
      'LoggingInterceptor',
    );

    if (Object.keys(requestBody).length) {
      this.logger.debug(
        `Request Body: ${JSON.stringify(requestBody)}`,
        'LoggingInterceptor',
      );
    }

    return next.handle().pipe(
      tap({
        next: (response) => {
          const responseTime = Date.now() - now;
          this.logger.log(
            `Response Time: ${responseTime}ms`,
            'LoggingInterceptor',
          );
          this.logger.debug(
            `Response Body: ${JSON.stringify(response)}`,
            'LoggingInterceptor',
          );
        },
        error: (error) => {
          const responseTime = Date.now() - now;
          this.logger.error(
            `Error Response Time: ${responseTime}ms`,
            error.stack,
            'LoggingInterceptor',
          );
        },
      }),
    );
  }
} 