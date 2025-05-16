export class IOtp {
    id?: string;
    mobile: string;
    code?: string;
    verificationSid?: string;
    expiresAt: Date;
    verified: boolean;
    reference?: string;
    metadata?: Record<string, any>;
  }
  