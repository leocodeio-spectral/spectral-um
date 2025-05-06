import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from '@leocodeio-njs/njs-logging';

@Injectable()
export class RateLimiterService {
  private loginLimiter: RateLimiterMemory;
  private refreshTokenLimiter: RateLimiterMemory;
  private verificationLimiter: RateLimiterMemory;
  private twoFactorLimiter: RateLimiterMemory;

  constructor(
    private configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setLogContext('RateLimiterService');

    // Initialize login rate limiter
    this.loginLimiter = new RateLimiterMemory({
      points: this.configService.get('RATE_LIMIT_LOGIN_POINTS') || 5, // 5 attempts
      duration: this.configService.get('RATE_LIMIT_LOGIN_DURATION') || 15 * 60, // per 15 minutes
      blockDuration:
        this.configService.get('RATE_LIMIT_LOGIN_BLOCK') || 60 * 60, // Block for 1 hour
    });

    // Initialize refresh token rate limiter
    this.refreshTokenLimiter = new RateLimiterMemory({
      points: this.configService.get('RATE_LIMIT_REFRESH_POINTS') || 5, // 5 attempts
      duration: this.configService.get('RATE_LIMIT_REFRESH_DURATION') || 60, // per 1 minute
      blockDuration: this.configService.get('RATE_LIMIT_REFRESH_BLOCK') || 300, // Block for 5 minutes
    });

    // Initialize verification rate limiter
    this.verificationLimiter = new RateLimiterMemory({
      points: this.configService.get('RATE_LIMIT_VERIFY_POINTS') || 3, // 3 attempts
      duration: this.configService.get('RATE_LIMIT_VERIFY_DURATION') || 10 * 60, // per 10 minutes
      blockDuration:
        this.configService.get('RATE_LIMIT_VERIFY_BLOCK') || 30 * 60, // Block for 30 minutes
    });

    // Initialize 2FA rate limiter
    this.twoFactorLimiter = new RateLimiterMemory({
      points: this.configService.get('RATE_LIMIT_2FA_POINTS') || 5, // 5 attempts
      duration: this.configService.get('RATE_LIMIT_2FA_DURATION') || 15 * 60, // per 15 minutes
      blockDuration: this.configService.get('RATE_LIMIT_2FA_BLOCK') || 60 * 60, // Block for 1 hour
    });

    this.logger.debug('Rate limiters initialized');
  }

  /**
   * Consume a rate limit point for login attempts
   * @param key Identifier for rate limiting (typically email/mobile)
   */
  async consumeLoginPoint(key: string): Promise<void> {
    await this.consumePoint(this.loginLimiter, `login:${key}`, 'login attempt');
  }

  /**
   * Consume a rate limit point for refresh token attempts
   * @param tokenId Unique token identifier
   */
  async consumeRefreshPoint(tokenId: string): Promise<void> {
    await this.consumePoint(
      this.refreshTokenLimiter,
      `refresh:${tokenId}`,
      'token refresh',
    );
  }

  /**
   * Consume a rate limit point for verification code attempts
   * @param mobile Mobile number being verified
   */
  async consumeVerificationPoint(mobile: string): Promise<void> {
    await this.consumePoint(
      this.verificationLimiter,
      `verify:${mobile}`,
      'verification attempt',
    );
  }

  /**
   * Consume a rate limit point for 2FA attempts
   * @param userId User ID attempting 2FA
   */
  async consume2FAPoint(userId: string): Promise<void> {
    await this.consumePoint(
      this.twoFactorLimiter,
      `2fa:${userId}`,
      '2FA attempt',
    );
  }

  /**
   * Consume a rate limit point for a general purpose
   * @param limiter The rate limiter to use
   * @param key Identifier for rate limiting
   * @param actionName Name of the action for logging
   */
  private async consumePoint(
    limiter: RateLimiterMemory,
    key: string,
    actionName: string,
  ): Promise<RateLimiterRes> {
    try {
      return await limiter.consume(key);
    } catch (error) {
      if (error instanceof Error) {
        this.logger.warn(`Rate limit exceeded for ${actionName}`, { key });
        throw new HttpException(
          `Too many ${actionName}s. Please try again later.`,
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      throw error;
    }
  }

  /**
   * Reset all points for a specific key
   * @param key The key to reset
   */
  async resetPoints(key: string): Promise<void> {
    try {
      await Promise.all([
        this.loginLimiter.delete(`login:${key}`),
        this.verificationLimiter.delete(`verify:${key}`),
        this.twoFactorLimiter.delete(`2fa:${key}`),
        // Don't reset refresh token limiter as it's tokenId-based
      ]);
      this.logger.debug(`Reset rate limits for key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to reset rate limits for key: ${key}`, error);
    }
  }

  /**
   * Get remaining points for a specific operation
   * @param type Type of operation
   * @param key Identifier for rate limiting
   */
  async getRemainingPoints(
    type: 'login' | 'refresh' | 'verify' | '2fa',
    key: string,
  ): Promise<number> {
    try {
      let limiter: RateLimiterMemory;
      let prefixedKey: string;

      switch (type) {
        case 'login':
          limiter = this.loginLimiter;
          prefixedKey = `login:${key}`;
          break;
        case 'refresh':
          limiter = this.refreshTokenLimiter;
          prefixedKey = `refresh:${key}`;
          break;
        case 'verify':
          limiter = this.verificationLimiter;
          prefixedKey = `verify:${key}`;
          break;
        case '2fa':
          limiter = this.twoFactorLimiter;
          prefixedKey = `2fa:${key}`;
          break;
      }

      const res = await limiter.get(prefixedKey);
      if (!res) return limiter.points;
      return limiter.points - res.consumedPoints;
    } catch (error) {
      this.logger.error(
        `Error getting remaining points for ${type}:${key}`,
        error,
      );
      return 0;
    }
  }
}
