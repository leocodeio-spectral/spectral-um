import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateToken, verifyToken as verifyTokenLib } from 'authenticator';
import {
  LoggerService,
  DebugUtil,
  CorrelationService,
} from '@leocodeio-njs/njs-logging';
import { SmsService } from './sms.service';

@Injectable()
export class Fast2SmsService implements SmsService {
  private apiKey: string;
  private isConfigured: boolean;
  private toptSecret: string;

  constructor(
    private configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly correlationService: CorrelationService,
  ) {
    this.logger.setLogContext('Fast2SmsService');
    this.apiKey = this.configService.get('FAST2SMS_API_KEY')!;
    this.toptSecret = this.configService.get('TOPT_SECRET') || '123123';
    this.isConfigured = !!this.apiKey;

    if (this.isConfigured) {
      this.logger.log('Fast2SMS service initialized successfully');
    } else {
      this.logger.warn(
        'Fast2SMS not configured. SMS features will be disabled.',
      );
    }
  }

  async sendVerification(mobile: string): Promise<{ sid: string }> {
    const otp = generateToken(mobile + 'AUTH' + this.toptSecret);
    console.log('otp', otp);
    if (!this.isConfigured) {
      this.logger.debug('[DEV MODE] Mock SMS send', {
        mobile,
        correlationId: this.correlationService.getCorrelationId(),
      });
      return { sid: `MOCK_${Date.now()}` };
    }

    try {
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          numbers: mobile,
          variables_values: otp,
          flash: 0,
        }),
      });
      console.log('response', response);

      const result: any = await response.json();
      console.log('result', result);
      if (!result.return) {
        throw new Error(result.message || 'Failed to send SMS');
      }

      return { sid: result.request_id };
    } catch (error) {
      this.logger.error('Failed to send SMS', error, {
        mobile,
        correlationId: this.correlationService.getCorrelationId(),
      });
      throw new Error('Failed to send verification code');
    }
  }

  async checkVerification(mobile: string, otp: string): Promise<boolean> {
    const result = verifyTokenLib(mobile + 'AUTH' + this.toptSecret, otp);
    console.log('result', result);
    return result?.delta === 0;
  }
}
