import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import { ICreatorPort, IEditorPort } from '../../domain/ports/user.port';
import {
  CREATOR_REPOSITORY,
  EDITOR_REPOSITORY,
} from 'src/auth/utils/services/constants';

@Injectable()
export class CreatorTwoFactorAuthService {
  constructor(
    @Inject(CREATOR_REPOSITORY) private userRepository: ICreatorPort,
    // Other dependencies...
  ) {}

  async setup2FA(
    userId: string,
  ): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const secret = authenticator.generateSecret();
    const qrCode = authenticator.keyuri(userId, 'Your App', secret);
    const backupCodes = await this.generateBackupCodes();

    await this.userRepository.update(userId, {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
      backupCodes: await Promise.all(
        backupCodes.map((code) => bcrypt.hash(code, 10)),
      ),
    });

    return { secret, qrCode, backupCodes };
  }

  async verify2FACode(userId: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA is not set up for this user.');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    return isValid;
  }

  private async generateBackupCodes(): Promise<string[]> {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      codes.push(code as never); // Type assertion to avoid TypeScript error
    }
    return codes;
  }
}

@Injectable()
export class EditorTwoFactorAuthService {
  constructor(
    @Inject(EDITOR_REPOSITORY) private userRepository: IEditorPort,
    // Other dependencies...
  ) {}

  async setup2FA(
    userId: string,
  ): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const secret = authenticator.generateSecret();
    const qrCode = authenticator.keyuri(userId, 'Your App', secret);
    const backupCodes = await this.generateBackupCodes();

    await this.userRepository.update(userId, {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
      backupCodes: await Promise.all(
        backupCodes.map((code) => bcrypt.hash(code, 10)),
      ),
    });

    return { secret, qrCode, backupCodes };
  }

  async verify2FACode(userId: string, code: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA is not set up for this user.');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    return isValid;
  }

  private async generateBackupCodes(): Promise<string[]> {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      codes.push(code as never); // Type assertion to avoid TypeScript error
    }
    return codes;
  }
}
