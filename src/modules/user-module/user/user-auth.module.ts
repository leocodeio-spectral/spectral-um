import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './infrastructure/entities/user.entity';
import { UserPreferences } from './infrastructure/entities/user-preferences.entity';
import { UserAuthController } from './presentation/controllers/user-auth.controller';
import { usersProvider } from './infrastructure/providers/users.provider';
import { JwtService } from '@nestjs/jwt';

import { IUserPort } from './domain/ports/user.port';
import { UserRepositoryAdapter } from './infrastructure/adapters/user.repository';
import { UserPreferencesRepositoryAdapter } from './infrastructure/adapters/user-preferences.repository';
import { IUserPreferencesPort } from './domain/ports/user-preferences.port';

import { PassportModule } from '@nestjs/passport';
import { OtpModule } from 'src/modules/common/otp/otp.module';
import { JwtStrategy } from './presentation/strategies/jwt.strategy';
import { LocalStrategy } from './presentation/strategies/local.strategy';
import { otpProvider } from 'src/modules/common/otp/infrastructure/providers/session.provider';
import { sessionProvider } from 'src/modules/common/session/infrastructure/providers/session.provider';
import { SessionRepositoryAdapter } from 'src/modules/common/session/infrastructure/adapters/session.repository';
import { ISessionPort } from 'src/modules/common/session/domain/ports/session.port';
import { AuthService } from './application/services/auth.service';

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
