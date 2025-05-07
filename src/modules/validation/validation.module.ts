import { Module } from '@nestjs/common';
import { ValidationService } from './application/services/validation.service';
import {
  CreatorValidationController,
  EditorValidationController,
} from './presentation/controllers/validation.controller';
import { JwtService } from '@nestjs/jwt';
import { CreatorOtpModule, EditorOtpModule } from 'src/modules/otp/otp.module';
import {
  CreatorAuthService,
  EditorAuthService,
} from '../user/application/services/auth.service';
import { ICreatorPort, IEditorPort } from '../user/domain/ports/user.port';
import {
  CreatorRepositoryAdapter,
  EditorRepositoryAdapter,
} from '../user/infrastructure/adapters/user.repository';
import {
  CreatorPreferencesRepositoryAdapter,
  EditorPreferencesRepositoryAdapter,
} from '../user/infrastructure/adapters/user-preferences.repository';
import {
  ICreatorPreferencesPort,
  IEditorPreferencesPort,
} from '../user/domain/ports/user-preferences.port';
import { ISessionPort } from 'src/modules/session/domain/ports/session.port';
import { SessionRepositoryAdapter } from 'src/modules/session/infrastructure/adapters/session.repository';
import { IOtpPort } from 'src/modules/otp/domain/ports/otp.port';
import { OTPRepositoryAdaptor } from 'src/modules/otp/infrastructure/adapters/otp.repository';
import {
  creatorsProvider,
  editorsProvider,
} from '../user/infrastructure/providers/users.provider';
import { sessionProvider } from 'src/modules/session/infrastructure/providers/session.provider';
import { otpProvider } from 'src/modules/otp/infrastructure/providers/session.provider';

@Module({
  imports: [CreatorOtpModule],
  controllers: [CreatorValidationController],
  providers: [
    CreatorAuthService,
    ValidationService,
    JwtService,
    {
      provide: ICreatorPort,
      useClass: CreatorRepositoryAdapter,
    },
    {
      provide: ICreatorPreferencesPort,
      useClass: CreatorPreferencesRepositoryAdapter,
    },
    {
      provide: ISessionPort,
      useClass: SessionRepositoryAdapter,
    },
    {
      provide: IOtpPort,
      useClass: OTPRepositoryAdaptor,
    },
    ...creatorsProvider,
    ...sessionProvider,
    ...otpProvider,
  ],
})
export class CreatorValidationModule {}

@Module({
  imports: [EditorOtpModule],
  controllers: [EditorValidationController],
  providers: [
    EditorAuthService,
    ValidationService,
    JwtService,
    {
      provide: IEditorPort,
      useClass: EditorRepositoryAdapter,
    },
    {
      provide: IEditorPreferencesPort,
      useClass: EditorPreferencesRepositoryAdapter,
    },
    {
      provide: ISessionPort,
      useClass: SessionRepositoryAdapter,
    },
    {
      provide: IOtpPort,
      useClass: OTPRepositoryAdaptor,
    },
    ...editorsProvider,
    ...sessionProvider,
    ...otpProvider,
  ],
})
export class EditorValidationModule {}
