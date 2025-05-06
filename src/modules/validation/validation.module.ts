import { Module } from '@nestjs/common';
import { ValidationService } from './application/services/validation.service';
import { ValidationController } from './presentation/controllers/validation.controller';
import { JwtService } from '@nestjs/jwt';

import { UserRegistrationService } from 'src/modules/user/application/services/user-registration.service';
import { UserAuthenticationService } from 'src/modules/user/application/services/user-authentication.service';
import { AuthService } from 'src/utils/services/auth.service';
import { AuthPolicyService } from 'src/utils/services/auth-policy.service';
import { UserRepositoryAdapter } from '../user/infrastructure/adapters/user.repository';
import { IUserPort } from '../user/domain/ports/user.port';
import { usersProvider } from '../user/infrastructure/providers/users.provider';

import { TwoFactorAuthService } from 'src/utils/services/two-factor-auth.service';
import { RateLimiterService } from 'src/utils/services/rate-limiter.service';

import { SessionRepositoryAdapter } from '../session/infrastructure/adapters/session.repository';
import { ISessionPort } from '../session/domain/ports/session.port';
import { sessionProvider } from '../session/infrastructure/providers/session.provider';

import { MobileVerificationService } from 'src/modules/otp/application/services/mobile-verification.service';
import { OTPRepositoryAdaptor } from '../otp/infrastructure/adapters/otp.repository';
import { IOtpPort } from '../otp/domain/ports/otp.port';
import { otpProvider } from '../otp/infrastructure/providers/session.provider';
import { IUserPreferencesPort } from '../user/domain/ports/user-preferences.port';
import { UserPreferencesRepositoryAdapter } from '../user/infrastructure/adapters/user-preferences.repository';
import { TokenManagementService } from '../session/application/services/token-management.service';
import { SessionManagementService } from '../session/application/services/session-management.service';
import { OtpModule } from '../otp/otp.module';

@Module({
  imports: [OtpModule],
  controllers: [ValidationController],
  providers: [
    AuthService,
    ValidationService,
    JwtService,
    {
      provide: IUserPort,
      useClass: UserRepositoryAdapter,
    },
    {
      provide: IUserPreferencesPort,
      useClass: UserPreferencesRepositoryAdapter,
    },
    {
      provide: ISessionPort,
      useClass: SessionRepositoryAdapter,
    },
    {
      provide: IOtpPort,
      useClass: OTPRepositoryAdaptor,
    },
    ...usersProvider,
    ...sessionProvider,
    ...otpProvider,
  ],
})
export class ValidationModule {}
