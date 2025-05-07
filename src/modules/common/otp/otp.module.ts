import { Module } from '@nestjs/common';
import { OTP } from './infrastructure/entities/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpController } from './presentation/controllers/otp.controller';
import { otpProvider } from './infrastructure/providers/session.provider';
import { IOtpPort } from './domain/ports/otp.port';
import { OTPRepositoryAdaptor } from './infrastructure/adapters/otp.repository';
import { SessionRepositoryAdapter } from '../session/infrastructure/adapters/session.repository';
import { ISessionPort } from '../session/domain/ports/session.port';
import { TokenManagementService } from '../session/application/services/token-management.service';
import { SessionManagementService } from '../session/application/services/session-management.service';
import { EmailjsMailerService } from './application/services/emailjs-mailer.service';
import { OtpService } from './application/services/otp.service';
import { MobileVerificationService } from './application/services/mobile-verification.service';
import { AuthService } from 'src/modules/user-module/user/application/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserAuthenticationService } from 'src/modules/user-module/user/application/services/user-authentication.service';
import { UserRegistrationService } from 'src/modules/user-module/user/application/services/user-registration.service';
import { TwoFactorAuthService } from 'src/modules/user-module/user/application/services/two-factor-auth.service';
import { RateLimiterService } from 'src/utils/services/rate-limiter.service';
import { AuthPolicyService } from 'src/modules/user-module/user/application/services/auth-policy.service';
import { IUserPort } from 'src/modules/user-module/user/domain/ports/user.port';
import { UserRepositoryAdapter } from 'src/modules/user-module/user/infrastructure/adapters/user.repository';
import { IUserPreferencesPort } from 'src/modules/user-module/user/domain/ports/user-preferences.port';
import { UserPreferencesRepositoryAdapter } from 'src/modules/user-module/user/infrastructure/adapters/user-preferences.repository';
import { usersProvider } from 'src/modules/user-module/user/infrastructure/providers/users.provider';
import { sessionProvider } from '../session/infrastructure/providers/session.provider';
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
