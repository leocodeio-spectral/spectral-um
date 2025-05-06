export const USER_REPOSITORY = 'USER_REPOSITORY';
export const USER_PREFERENCES_REPOSITORY = 'USER_PREFERENCES_REPOSITORY';
export const SESSION_REPOSITORY = 'SESSION_REPOSITORY';

// OTP
import { TwilioSmsService } from '../../modules/otp/application/services/twilio.service';
import { Fast2SmsService } from '../../modules/otp/application/services/fast2sms.service';
export const SMS_SERVICE = 'SMS_SERVICE';
export const OTP_REPOSITORY = 'OTP_REPOSITORY';
export const AvailableSmsServices = {
  twilio: TwilioSmsService,
  fast2sms: Fast2SmsService,
};
