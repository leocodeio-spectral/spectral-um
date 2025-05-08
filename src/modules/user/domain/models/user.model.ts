import { AccessLevel } from '../enums/access-level.enum';
import { userStatus } from '../enums/user_status.enum';

export class ICreator {
  id: string;
  email: string;
  mobile?: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  profilePicUrl?: string;
  status: userStatus;
  deletedAt: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  allowedChannels: string[];
  accessLevel: AccessLevel;
  refreshToken?: string;
  backupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
  role: 'creator';
}

export class IEditor {
  id: string;
  email: string;
  mobile?: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  profilePicUrl?: string;
  status: userStatus;
  deletedAt: Date;
  twoFactorSecret?: string;
  twoFactorEnabled: boolean;
  lastLoginAt?: Date;
  allowedChannels: string[];
  accessLevel: AccessLevel;
  refreshToken?: string;
  backupCodes?: string[];
  createdAt: Date;
  updatedAt: Date;
  role: 'editor' ;
}
