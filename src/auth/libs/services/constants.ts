import { Fast2SmsService } from 'src/auth/modules/otp/application/services/fast2sms.service';
import { TwilioSmsService } from 'src/auth/modules/otp/application/services/twilio.service';

export const CREATOR_REPOSITORY = 'CREATOR_REPOSITORY';
export const CREATOR_PREFERENCES_REPOSITORY = 'CREATOR_PREFERENCES_REPOSITORY';
export const EDITOR_REPOSITORY = 'EDITOR_REPOSITORY';
export const EDITOR_PREFERENCES_REPOSITORY = 'EDITOR_PREFERENCES_REPOSITORY';
export const SESSION_REPOSITORY = 'SESSION_REPOSITORY';

// OTP
export const SMS_SERVICE = 'SMS_SERVICE';
export const OTP_REPOSITORY = 'OTP_REPOSITORY';
export const AvailableSmsServices = {
  twilio: TwilioSmsService,
  fast2sms: Fast2SmsService,
};
