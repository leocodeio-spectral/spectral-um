import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsService } from './sms.service';
import {
  LoggerService,
  DebugUtil,
  CorrelationService,
} from '@leocodeio-njs/njs-logging';

@Injectable()
export class TwilioSmsService implements SmsService {
  private client: any;
  private serviceSid: string;
  private isConfigured: boolean;

  constructor(
    private configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly debugUtil: DebugUtil,
    private readonly correlationService: CorrelationService,
  ) {
    this.logger.setLogContext('TwilioSmsService');

    const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get('TWILIO_AUTH_TOKEN');
    this.serviceSid = this.configService.get('TWILIO_SERVICE_SID')!;
    // this.debugUtil.debug(this.logger, 'Twilio credentials', {
    //   accountSid,
    //   authToken,
    //   serviceSid: this.serviceSid,
    // });

    this.isConfigured = !!(accountSid && authToken && this.serviceSid);

    if (this.isConfigured) {
      this.client = require('twilio')(accountSid, authToken);
      this.logger.log('Twilio service initialized successfully');
    } else {
      this.logger.warn(
        'Twilio credentials not configured. SMS features will be disabled.',
      );
    }
  }

  async sendVerification(mobile: string): Promise<{ sid: string }> {
    this.logger.debug('Attempting to send verification', {
      mobile,
      correlationId: this.correlationService.getCorrelationId(),
    });

    if (!this.isConfigured) {
      this.logger.debug('[DEV MODE] Mock verification send', {
        mobile,
        correlationId: this.correlationService.getCorrelationId(),
      });
      return { sid: `MOCK_${Date.now()}` };
    }

    try {
      const response = await this.client.verify
        .services(this.serviceSid)
        .verifications.create({
          to: mobile,
          channel: 'sms',
        });

      this.debugUtil.debug(this.logger, 'Verification sent successfully', {
        mobile,
        sid: response.sid,
        correlationId: this.correlationService.getCorrelationId(),
      });

      return { sid: response.sid };
    } catch (error) {
      this.logger.error('Failed to send verification code', error, {
        mobile,
        correlationId: this.correlationService.getCorrelationId(),
      });
      throw new Error('Failed to send verification code');
    }
  }

  async checkVerification(mobile: string, code: string): Promise<boolean> {
    this.logger.debug('Checking verification code', {
      mobile,
      correlationId: this.correlationService.getCorrelationId(),
    });

    if (!this.isConfigured) {
      this.logger.debug('[DEV MODE] Mock verification check', {
        mobile,
        code,
        correlationId: this.correlationService.getCorrelationId(),
      });
      return true;
    }

    try {
      const response = await this.client.verify
        .services(this.serviceSid)
        .verificationChecks.create({
          to: mobile,
          code,
        });

      const isValid = response.status === 'approved';
      this.logger.debug('Verification check result', {
        mobile,
        isValid,
        status: response.status,
        correlationId: this.correlationService.getCorrelationId(),
      });

      return isValid;
    } catch (error) {
      this.logger.error('Verification check failed', error, {
        mobile,
        correlationId: this.correlationService.getCorrelationId(),
      });
      return false;
    }
  }
}
