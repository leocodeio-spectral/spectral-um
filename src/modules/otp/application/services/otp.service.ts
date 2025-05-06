import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private readonly TIME_STEP = 60; // 60 seconds validity

  /**
   * Generates a 6-digit time-based OTP
   * @param key - Unique identifier (email or phone)
   * @param salt - Application salt for added security
   * @returns 6-digit OTP
   */
  generateToken(key: string, salt: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const counter = Math.floor(timestamp / this.TIME_STEP);

    const input = `${key}${salt}${counter}`;
    const hash = crypto.createHash('sha256').update(input).digest();

    // Extract a 4-byte integer from the hash using offset
    const offset = hash[hash.length - 1] & 0xf;
    const code =
      ((hash[offset] & 0x7f) << 24) |
      (hash[offset + 1] << 16) |
      (hash[offset + 2] << 8) |
      hash[offset + 3];

    // Get 6 digits
    return (code % 1000000).toString().padStart(6, '0');
  }

  /**
   * Verify if the provided OTP is valid
   * @param key - Unique identifier (email or phone)
   * @param salt - Application salt for added security
   * @param token - OTP to verify
   * @returns boolean indicating if OTP is valid
   */
  verifyToken(key: string, salt: string, token: string): boolean {
    if (token.length !== 6 || !/^\d{6}$/.test(token)) {
      return false;
    }

    const currentToken = this.generateToken(key, salt);

    // Check current window
    if (token === currentToken) {
      return true;
    }

    // Check previous window (to account for delay in transmission)
    const timestamp = Math.floor(Date.now() / 1000);
    const prevCounter = Math.floor(
      (timestamp - this.TIME_STEP) / this.TIME_STEP,
    );
    const prevInput = `${key}${salt}${prevCounter}`;
    const prevHash = crypto.createHash('sha256').update(prevInput).digest();

    const prevOffset = prevHash[prevHash.length - 1] & 0xf;
    const prevCode =
      ((prevHash[prevOffset] & 0x7f) << 24) |
      (prevHash[prevOffset + 1] << 16) |
      (prevHash[prevOffset + 2] << 8) |
      prevHash[prevOffset + 3];

    const prevToken = (prevCode % 1000000).toString().padStart(6, '0');

    return token === prevToken;
  }
}
