import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/entities/user.entity';
import { UserPreferences } from './infrastructure/entities/user-preferences.entity';
import { UserAuthController } from './presentation/controllers/user-auth.controller';
import { AuthService } from 'src/utils/services/auth.service';
import { usersProvider } from './infrastructure/providers/users.provider';
import { sessionProvider } from '../session/infrastructure/providers/session.provider';
import { JwtService } from '@nestjs/jwt';
import { UserAuthenticationService } from 'src/modules/user/application/services/user-authentication.service';

import { TwoFactorAuthService } from 'src/utils/services/two-factor-auth.service';
import { MobileVerificationService } from 'src/modules/otp/application/services/mobile-verification.service';
import { UserRegistrationService } from 'src/modules/user/application/services/user-registration.service';
import { RateLimiterService } from 'src/utils/services/rate-limiter.service';
import { AuthPolicyService } from 'src/utils/services/auth-policy.service';
import { IUserPreferences } from './domain/models/user-preferences.model';
import { IUserPort } from './domain/ports/user.port';
import { UserRepositoryAdapter } from './infrastructure/adapters/user.repository';
import { UserPreferencesRepositoryAdapter } from './infrastructure/adapters/user-preferences.repository';
import { IUserPreferencesPort } from './domain/ports/user-preferences.port';

import { PassportModule } from '@nestjs/passport';
import { ISessionPort } from '../session/domain/ports/session.port';
import { SessionRepositoryAdapter } from '../session/infrastructure/adapters/session.repository';
import { TokenManagementService } from '../session/application/services/token-management.service';
import { SessionManagementService } from '../session/application/services/session-management.service';
import { JwtStrategy } from 'src/utils/strategies/jwt.strategy';
import { LocalStrategy } from 'src/utils/strategies/local.strategy';
import { OtpModule } from '../otp/otp.module';
import { otpProvider } from '../otp/infrastructure/providers/session.provider';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, UserPreferences]),
    OtpModule,
  ],
  controllers: [UserAuthController],
  providers: [
    AuthService,
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
    ...usersProvider,
    ...sessionProvider,
    ...otpProvider,

    // passport js
    LocalStrategy,
    JwtStrategy,
  ],
})
export class UserModule {}
