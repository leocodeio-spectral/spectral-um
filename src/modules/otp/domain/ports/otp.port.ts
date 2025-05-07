import { IOtp } from '../models/otp.model';
export abstract class IOtpPort {
  abstract save(otp: Partial<IOtp>): Promise<IOtp>;
  abstract verify(mobile: string, code: string): Promise<boolean>;
  abstract findPendingOTP(mobile: string): Promise<IOtp | null>;
  abstract markAsVerified(id: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findByReference(reference: string): Promise<IOtp | null>;
  abstract deleteByReference(reference: string): Promise<void>;
}
