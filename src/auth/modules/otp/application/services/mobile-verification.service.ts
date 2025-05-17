import { Inject, Injectable } from '@nestjs/common';
import { SmsService } from './sms.service';
import { ConfigService } from '@nestjs/config';
import {
  CorrelationService,
  DebugUtil,
  LoggerService,
} from '@leocodeio-njs/njs-logging';
import { IOtpPort } from '../../domain/ports/otp.port';
import { RateLimiterService } from 'src/auth/libs/services/rate-limiter.service';

@Injectable()
export class MobileVerificationService {
  constructor(
    @Inject('SMS_SERVICE') private smsService: SmsService,
    private readonly otpRepository: IOtpPort,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly debugUtil: DebugUtil,
    private readonly correlationService: CorrelationService,
  ) {}

  async requestMobileOTP(mobile: string): Promise<string> {
    this.logger.debug('Starting mobile OTP request', {
      mobile,
      correlationId: this.correlationService.getCorrelationId(),
    });

    await this.rateLimiterService.consumeVerificationPoint(mobile);
    const testNumbers =
      this.configService.get('TEST_PHONE_NUMBERS')?.split(',') || [];

    this.debugUtil.debug(this.logger, 'Test numbers configuration', {
      testNumbers,
      correlationId: this.correlationService.getCorrelationId(),
    });

    if (!testNumbers.includes(mobile)) {
      this.logger.debug('Production number detected, using Twilio', {
        mobile,
        correlationId: this.correlationService.getCorrelationId(),
      });

      try {
        const twilioVerificationResponse =
          await this.smsService.sendVerification(mobile);

        this.debugUtil.debug(
          this.logger,
          'Twilio verification response received',
          {
            mobile,
            sid: twilioVerificationResponse.sid,
            correlationId: this.correlationService.getCorrelationId(),
          },
        );

        const otp = await this.otpRepository.save({
          mobile,
          reference: crypto.randomUUID(),
          verificationSid: 'MOBILE' + twilioVerificationResponse.sid,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          verified: false,
        });

        this.logger.debug('OTP saved successfully', {
          otp,
          mobile,
          correlationId: this.correlationService.getCorrelationId(),
        });
        return otp.reference as string;
      } catch (error) {
        this.logger.error('Failed to send verification code', error, {
          mobile,
          correlationId: this.correlationService.getCorrelationId(),
        });
        throw new Error('Failed to send verification code');
      }
    } else {
      this.logger.debug('Test number detected, generating local OTP', {
        mobile,
        correlationId: this.correlationService.getCorrelationId(),
      });

      const code = this.generateOTP();
      try {
        const otp = await this.otpRepository.save({
          mobile,
          code,
          reference: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          verified: false,
        });

        this.logger.debug('Test OTP saved successfully', {
          mobile,
          code, // Only logging code in test mode
          reference: otp.reference,
          correlationId: this.correlationService.getCorrelationId(),
        });
        return otp.reference as string;
      } catch (error) {
        this.logger.error('Failed to save test OTP', error, {
          mobile,
          correlationId: this.correlationService.getCorrelationId(),
        });
        throw error;
      }
    }
  }

  async verifyOTP(mobile: string, code: string): Promise<boolean> {
    const testNumbers =
      this.configService.get('TEST_PHONE_NUMBERS')?.split(',') || [];

    if (!testNumbers.includes(mobile)) {
      // For production numbers, verify through Twilio
      const storedOTP = await this.otpRepository.findPendingOTP(mobile);

      if (!storedOTP) return false;

      const isValid = await this.smsService.checkVerification(
        mobile,
        code,
        storedOTP.verificationSid as string,
      );
      if (isValid) {
        await this.otpRepository.markAsVerified(storedOTP.id as string);
        return true;
      }
      return false;
    } else {
      // For test numbers, verify against our stored OTP
      return this.otpRepository.verify(mobile, code);
    }
  }

  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
