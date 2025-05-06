import { Module } from '@nestjs/common';
import { OTP } from './infrastructure/entities/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpController } from './presentation/controllers/otp.controller';
import { AuthService } from 'src/utils/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserAuthenticationService } from 'src/modules/user/application/services/user-authentication.service';

import { TwoFactorAuthService } from 'src/utils/services/two-factor-auth.service';
import { MobileVerificationService } from 'src/modules/otp/application/services/mobile-verification.service';
import { UserRegistrationService } from 'src/modules/user/application/services/user-registration.service';
import { RateLimiterService } from 'src/utils/services/rate-limiter.service';
import { AuthPolicyService } from 'src/utils/services/auth-policy.service';
import { usersProvider } from '../user/infrastructure/providers/users.provider';
import { sessionProvider } from '../session/infrastructure/providers/session.provider';
import { otpProvider } from './infrastructure/providers/session.provider';
import { IUserPort } from '../user/domain/ports/user.port';
import { UserRepositoryAdapter } from '../user/infrastructure/adapters/user.repository';
import { IUserPreferencesPort } from '../user/domain/ports/user-preferences.port';
import { UserPreferencesRepositoryAdapter } from '../user/infrastructure/adapters/user-preferences.repository';
import { IOtpPort } from './domain/ports/otp.port';
import { OTPRepositoryAdaptor } from './infrastructure/adapters/otp.repository';
import { SessionRepositoryAdapter } from '../session/infrastructure/adapters/session.repository';
import { ISessionPort } from '../session/domain/ports/session.port';
import { TokenManagementService } from '../session/application/services/token-management.service';
import { SessionManagementService } from '../session/application/services/session-management.service';
import { EmailjsMailerService } from './application/services/emailjs-mailer.service';
import { OtpService } from './application/services/otp.service';

@Module({
  imports: [TypeOrmModule.forFeature([OTP])],
  controllers: [OtpController],
  providers: [
    AuthService,
    JwtService,
    UserAuthenticationService,
    TokenManagementService,
    SessionManagementService,
    TwoFactorAuthService,
    MobileVerificationService,
    UserRegistrationService,
    RateLimiterService,
    AuthPolicyService,
    EmailjsMailerService,
    OtpService,
    {
      provide: ISessionPort,
      useClass: SessionRepositoryAdapter,
    },
    {
      provide: IOtpPort,
      useClass: OTPRepositoryAdaptor,
    },
    {
      provide: IUserPort,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: IUserPreferencesPort,
      useClass: UserPreferencesRepositoryAdapter,
    },
    ...usersProvider,
    ...sessionProvider,
    ...otpProvider,
  ],
  exports: [
    IOtpPort,
    UserAuthenticationService,
    TokenManagementService,
    SessionManagementService,
    TwoFactorAuthService,
    MobileVerificationService,
    UserRegistrationService,
    RateLimiterService,
    AuthPolicyService,
    EmailjsMailerService,
    OtpService,
  ],
})
export class OtpModule {}
