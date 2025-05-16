import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  LoggerService,
  DebugUtil,
  CorrelationService,
} from '@leocodeio-njs/njs-logging';
import * as nodemailer from 'nodemailer';
import { generateToken, verifyToken } from 'authenticator';
import { OtpService } from './otp.service';
import { RateLimiterService } from 'src/auth/utils/services/rate-limiter.service';
import { IOtpPort } from '../../domain/ports/otp.port';
import e from 'express';

@Injectable()
export class EmailjsMailerService {
  private isConfigured: boolean;
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly debugUtil: DebugUtil,
    private readonly otpService: OtpService,
    private readonly correlationService: CorrelationService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly otpRepository: IOtpPort,
  ) {
    this.logger.setLogContext('EmailjsMailerService');

    const gmailUser = this.configService.get('GMAIL_USER');
    const gmailAppPassword = this.configService.get('GMAIL_APP_PASSWORD');

    this.isConfigured = !!(gmailUser && gmailAppPassword);

    if (this.isConfigured) {
      // Initialize nodemailer transporter
      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      this.logger.log('Email service initialized successfully');
    } else {
      this.logger.warn(
        'Email credentials not configured. Email features will be limited.',
      );
    }
  }

  async sendOtpMail(email: string, name: string, otp: string): Promise<string> {
    if (!this.isConfigured) {
      this.logger.debug('[DEV MODE] Mock email send', {
        email,
        correlationId: this.correlationService.getCorrelationId(),
      });
      return 'emailjs not configured';
    }

    this.logger.debug('Starting mobile OTP request', {
      email,
      correlationId: this.correlationService.getCorrelationId(),
    });

    await this.rateLimiterService.consumeVerificationPoint(email);
    const testMails = this.configService.get('TEST_EMAILS')?.split(',') || [];

    this.debugUtil.debug(this.logger, 'Test emails configuration', {
      testMails,
      correlationId: this.correlationService.getCorrelationId(),
    });

    if (!testMails.includes(email)) {
      this.logger.debug('Production email detected, using Twilio', {
        email,
        correlationId: this.correlationService.getCorrelationId(),
      });

      try {
        const template = {
          subject: 'Your OTP Code',
          body: `Hello ${name}, your OTP code is ${otp}.`,
        };

        const mailOptions: nodemailer.SendMailOptions = {
          from: this.configService.get('EMAIL_FROM') || 'noreply@example.com',
          to: email,
          subject: template.subject,
          html: template.body,
        };

        const mailResult = await this.transporter.sendMail(mailOptions);

        this.debugUtil.debug(this.logger, 'Email sent successfully', {
          email,
          mailId: mailResult.messageId,
          correlationId: this.correlationService.getCorrelationId(),
        });

        const otpResult = await this.otpRepository.save({
          mobile: email,
          code: otp,
          reference: crypto.randomUUID(),
          verificationSid: 'MAIL' + mailResult.messageId,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          verified: false,
        });

        this.logger.debug('OTP saved successfully', {
          otp,
          email,
          correlationId: this.correlationService.getCorrelationId(),
        });
        return otpResult.reference as string;
      } catch (error) {
        this.logger.error('Failed to send email', error, {
          email,
          correlationId: this.correlationService.getCorrelationId(),
        });
        throw new Error('Failed to send email');
      }
    } else {
      this.logger.debug('Test number detected, generating local OTP', {
        email,
        correlationId: this.correlationService.getCorrelationId(),
      });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      try {
        const otp = await this.otpRepository.save({
          mobile: email,
          code,
          reference: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          verified: false,
        });

        this.logger.debug('Test OTP saved successfully', {
          email,
          code, // Only logging code in test mode
          reference: otp.reference,
          correlationId: this.correlationService.getCorrelationId(),
        });
        return otp.reference as string;
      } catch (error) {
        this.logger.error('Failed to save test OTP', error, {
          email,
          correlationId: this.correlationService.getCorrelationId(),
        });
        throw error;
      }
    }
  }

  async verifyOtpMail(email: string, code: string): Promise<boolean> {
    this.logger.debug('Attempting to verify email OTP', {
      email,
      correlationId: this.correlationService.getCorrelationId(),
    });
    await this.rateLimiterService.consumeVerificationPoint(email);
    const testMails = this.configService.get('TEST_EMAILS')?.split(',') || [];

    if (!testMails.includes(email)) {
      // For production emails, verify through Twilio
      const storedOTP = await this.otpRepository.findPendingOTP(email);

      if (!storedOTP) return false;
      const isValid = this.otpService.verifyToken(
        email,
        this.configService.get('TOPT_SECRET') || 'default-salt',
        code,
      );
      if (isValid) {
        await this.otpRepository.markAsVerified(storedOTP.id as string);
        return true;
      }
      return isValid;
    } else {
      return this.otpRepository.verify(email, code);
    }
  }
}
