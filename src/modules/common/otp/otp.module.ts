import { Module } from '@nestjs/common';
import { OTP } from './infrastructure/entities/otp.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CreatorOtpController,
  EditorOtpController,
} from './presentation/controllers/otp.controller';
import { otpProvider } from './infrastructure/providers/session.provider';
import { IOtpPort } from './domain/ports/otp.port';
import { OTPRepositoryAdaptor } from './infrastructure/adapters/otp.repository';
import { SessionRepositoryAdapter } from '../session/infrastructure/adapters/session.repository';
import { ISessionPort } from '../session/domain/ports/session.port';
import {
  CreatorTokenManagementService,
  EditorTokenManagementService,
} from '../session/application/services/token-management.service';
import { SessionManagementService } from '../session/application/services/session-management.service';
import { EmailjsMailerService } from './application/services/emailjs-mailer.service';
import { OtpService } from './application/services/otp.service';
import { MobileVerificationService } from './application/services/mobile-verification.service';
import {
  CreatorAuthService,
  EditorAuthService,
} from 'src/modules/user-module/user/application/services/auth.service';
import { JwtService } from '@nestjs/jwt';
import {
  CreatorAuthenticationService,
  EditorAuthenticationService,
} from 'src/modules/user-module/user/application/services/user-authentication.service';
import {
  CreatorRegistrationService,
  EditorRegistrationService,
} from 'src/modules/user-module/user/application/services/user-registration.service';
import {
  CreatorTwoFactorAuthService,
  EditorTwoFactorAuthService,
} from 'src/modules/user-module/user/application/services/two-factor-auth.service';
import { RateLimiterService } from 'src/utils/services/rate-limiter.service';
import {
  CreatorAuthPolicyService,
  EditorAuthPolicyService,
} from 'src/modules/user-module/user/application/services/auth-policy.service';
import {
  ICreatorPort,
  IEditorPort,
} from 'src/modules/user-module/user/domain/ports/user.port';
import {
  EditorRepositoryAdapter,
  CreatorRepositoryAdapter,
} from 'src/modules/user-module/user/infrastructure/adapters/user.repository';
import {
  ICreatorPreferencesPort,
  IEditorPreferencesPort,
} from 'src/modules/user-module/user/domain/ports/user-preferences.port';
import {
  CreatorPreferencesRepositoryAdapter,
  EditorPreferencesRepositoryAdapter,
} from 'src/modules/user-module/user/infrastructure/adapters/user-preferences.repository';
import {
  creatorsProvider,
  editorsProvider,
} from 'src/modules/user-module/user/infrastructure/providers/users.provider';
import { sessionProvider } from '../session/infrastructure/providers/session.provider';

@Module({
  imports: [TypeOrmModule.forFeature([OTP])],
  controllers: [CreatorOtpController],
  providers: [
    CreatorAuthService,
    JwtService,
    CreatorAuthenticationService,
    CreatorTokenManagementService,
    SessionManagementService,
    CreatorTwoFactorAuthService,
    MobileVerificationService,
    CreatorRegistrationService,
    RateLimiterService,
    CreatorAuthPolicyService,
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
      provide: ICreatorPort,
      useClass: CreatorRepositoryAdapter,
    },
    {
      provide: ICreatorPreferencesPort,
      useClass: CreatorPreferencesRepositoryAdapter,
    },
    ...creatorsProvider,
    ...sessionProvider,
    ...otpProvider,
  ],
  exports: [
    IOtpPort,
    CreatorAuthenticationService,
    CreatorTokenManagementService,
    SessionManagementService,
    CreatorTwoFactorAuthService,
    MobileVerificationService,
    CreatorRegistrationService,
    RateLimiterService,
    CreatorAuthPolicyService,
    EmailjsMailerService,
    OtpService,
  ],  
})
export class CreatorOtpModule {}

@Module({
  imports: [TypeOrmModule.forFeature([OTP])],
  controllers: [EditorOtpController],
  providers: [
    EditorAuthService,
    JwtService,
    EditorAuthenticationService,
    EditorTokenManagementService,
    SessionManagementService,
    EditorTwoFactorAuthService,
    MobileVerificationService,
    EditorRegistrationService,
    RateLimiterService,
    EditorAuthPolicyService,
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
      provide: IEditorPort,
      useClass: EditorRepositoryAdapter,
    },
    {
      provide: IEditorPreferencesPort,
      useClass: EditorPreferencesRepositoryAdapter,
    },
    ...editorsProvider,
    ...sessionProvider,
    ...otpProvider,
  ],
  exports: [
    IOtpPort,
    EditorAuthenticationService,
    EditorTokenManagementService,
    SessionManagementService,
    EditorTwoFactorAuthService,
    MobileVerificationService,
    EditorRegistrationService,
    RateLimiterService,
    EditorAuthPolicyService,
    EmailjsMailerService,
    OtpService,
  ],
})
export class EditorOtpModule {}
