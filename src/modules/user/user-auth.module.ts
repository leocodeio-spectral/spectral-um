import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Creator, Editor } from './infrastructure/entities/user.entity';
import {
  CreatorPreferences,
  EditorPreferences,
} from './infrastructure/entities/user-preferences.entity';
import {
  CreatorAuthController,
  EditorAuthController,
} from './presentation/controllers/user-auth.controller';
import {
  creatorsProvider,
  editorsProvider,
} from './infrastructure/providers/users.provider';
import { JwtService } from '@nestjs/jwt';

import { ICreatorPort, IEditorPort } from './domain/ports/user.port';
import {
  ICreatorPreferencesPort,
  IEditorPreferencesPort,
} from './domain/ports/user-preferences.port';

import { PassportModule } from '@nestjs/passport';
import { CreatorOtpModule, EditorOtpModule } from 'src/modules/otp/otp.module';
import {
  EditorJwtStrategy,
  CreatorJwtStrategy,
} from './presentation/strategies/jwt.strategy';
import {
  CreatorLocalStrategy,
  EditorLocalStrategy,
} from './presentation/strategies/local.strategy';
import { otpProvider } from 'src/modules/otp/infrastructure/providers/session.provider';
import { sessionProvider } from 'src/modules/session/infrastructure/providers/session.provider';
import { SessionRepositoryAdapter } from 'src/modules/session/infrastructure/adapters/session.repository';
import { ISessionPort } from 'src/modules/session/domain/ports/session.port';
import {
  CreatorAuthService,
  EditorAuthService,
} from './application/services/auth.service';
import {
  CreatorRepositoryAdapter,
  EditorRepositoryAdapter,
} from './infrastructure/adapters/user.repository';
import {
  CreatorPreferencesRepositoryAdapter,
  EditorPreferencesRepositoryAdapter,
} from './infrastructure/adapters/user-preferences.repository';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([Creator, CreatorPreferences]),
    CreatorOtpModule,
  ],
  controllers: [CreatorAuthController],
  providers: [
    CreatorAuthService,
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
    ...creatorsProvider,
    ...sessionProvider,
    ...otpProvider,

    // passport js
    CreatorLocalStrategy,
    CreatorJwtStrategy,
  ],
})
export class CreatorModule {}

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([Editor, EditorPreferences]),
    EditorOtpModule,
  ],
  controllers: [EditorAuthController],
  providers: [
    EditorAuthService,
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
    ...editorsProvider,
    ...sessionProvider,
    ...otpProvider,

    // passport js
    EditorLocalStrategy,
    EditorJwtStrategy,
  ],
})
export class EditorModule {}
