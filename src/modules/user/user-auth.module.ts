import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/entities/user.entity';
import { UserPreferences } from './infrastructure/entities/user-preferences.entity';
import { UserAuthController } from './presentation/controllers/user-auth.controller';
import { AuthService } from 'src/modules/user/application/services/auth.service';
import { usersProvider } from './infrastructure/providers/users.provider';
import { JwtService } from '@nestjs/jwt';

import { IUserPort } from './domain/ports/user.port';
import { UserRepositoryAdapter } from './infrastructure/adapters/user.repository';
import { UserPreferencesRepositoryAdapter } from './infrastructure/adapters/user-preferences.repository';
import { IUserPreferencesPort } from './domain/ports/user-preferences.port';

import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from 'src/utils/strategies/jwt.strategy';
import { LocalStrategy } from 'src/utils/strategies/local.strategy';
import { ISessionPort } from '../core/session/domain/ports/session.port';
import { SessionRepositoryAdapter } from '../core/session/infrastructure/adapters/session.repository';
import { sessionProvider } from '../core/session/infrastructure/providers/session.provider';
import { otpProvider } from '../core/otp/infrastructure/providers/session.provider';
import { OtpModule } from '../core/otp/otp.module';

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
