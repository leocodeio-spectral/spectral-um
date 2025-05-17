import { DataSource } from 'typeorm';
import {
  AvailableSmsServices,
  OTP_REPOSITORY,
  SMS_SERVICE,
} from 'src/auth/libs/services/constants';
import { OTP } from '../entities/otp.entity';
import { ConfigService } from '@nestjs/config';
import { TwilioSmsService } from '../../application/services/twilio.service';

const configService = new ConfigService();
export const otpProvider = [
  {
    provide: OTP_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(OTP),
    inject: [DataSource],
  },
  {
    provide: SMS_SERVICE,
    useClass:
      AvailableSmsServices[configService.get('SMS_SERVICE')] ||
      TwilioSmsService,
  },
];
