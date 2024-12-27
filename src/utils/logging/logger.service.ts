import { Injectable, ConsoleLogger } from '@nestjs/common';
import { ILogger } from '../../common/interfaces/logger.interface';

@Injectable()
export class LoggerService extends ConsoleLogger implements ILogger {
  protected contextName?: string;

  public setContext(context: string) {
    this.contextName = context;
  }

  log(message: string, context?: string) {
    super.log(message, context || this.contextName);
  }

  error(message: string, trace?: string, context?: string) {
    super.error(message, trace, context || this.contextName);
  }

  warn(message: string, context?: string) {
    super.warn(message, context || this.contextName);
  }

  debug(message: string, context?: string) {
    super.debug(message, context || this.contextName);
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context || this.contextName);
  }
} 