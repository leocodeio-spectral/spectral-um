import { Module } from '@nestjs/common';
import { ValidationService } from './application/services/validation.service';
import { ValidationController } from './presentation/controllers/validation.controller';
import { JwtService } from '@nestjs/jwt';
import { OtpModule } from 'src/modules/common/otp/otp.module';
import { AuthService } from '../user/application/services/auth.service';
import { IUserPort } from '../user/domain/ports/user.port';
import { UserRepositoryAdapter } from '../user/infrastructure/adapters/user.repository';
import { UserPreferencesRepositoryAdapter } from '../user/infrastructure/adapters/user-preferences.repository';
import { IUserPreferencesPort } from '../user/domain/ports/user-preferences.port';
import { ISessionPort } from 'src/modules/common/session/domain/ports/session.port';
import { SessionRepositoryAdapter } from 'src/modules/common/session/infrastructure/adapters/session.repository';
import { IOtpPort } from 'src/modules/common/otp/domain/ports/otp.port';
import { OTPRepositoryAdaptor } from 'src/modules/common/otp/infrastructure/adapters/otp.repository';
import { usersProvider } from '../user/infrastructure/providers/users.provider';
import { sessionProvider } from 'src/modules/common/session/infrastructure/providers/session.provider';
import { otpProvider } from 'src/modules/common/otp/infrastructure/providers/session.provider';

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
