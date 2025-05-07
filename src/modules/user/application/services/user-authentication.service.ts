import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { TwoFactorAuthService } from './two-factor-auth.service';

import { CorrelationService, LoggerService } from '@leocodeio-njs/njs-logging';
import { RateLimiterService } from '../../../../utils/services/rate-limiter.service';
import { USER_REPOSITORY } from '../../../../utils/services/constants';
import {
  DeviceInfoDto,
  LoginDto,
} from 'src/modules/user/application/dtos/login.dto';
import { LogoutDto } from 'src/modules/user/application/dtos/logout.dto';
import { IUserPort } from 'src/modules/user/domain/ports/user.port';
import { IUser } from 'src/modules/user/domain/models/user.model';
import { TokenManagementService } from 'src/modules/core/session/application/services/token-management.service';
import { SessionManagementService } from 'src/modules/core/session/application/services/session-management.service';

@Injectable()
export class UserAuthenticationService {
  constructor(
    private readonly userRepository: IUserPort,
    private readonly tokenManagementService: TokenManagementService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly logger: LoggerService,
    private readonly rateLimiterService: RateLimiterService,
    private readonly correlationService: CorrelationService,
  ) {
    this.logger.setLogContext('UserAuthenticationService');
  }

  /**
   * Validate user credentials (used by Passport local strategy)
   */
  async validateUser(identifier: string, password: string): Promise<IUser> {
    this.logger.debug('Validating user credentials', {
      identifier,
      correlationId: this.correlationService.getCorrelationId(),
    });

    await this.rateLimiterService.consumeLoginPoint(identifier);

    const user = await this.userRepository.findByIdentifier(identifier);
    if (!user) {
      this.logger.warn('User not found during validation', {
        identifier,
        correlationId: this.correlationService.getCorrelationId(),
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      this.logger.warn('Invalid password provided', {
        identifier,
        correlationId: this.correlationService.getCorrelationId(),
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  /**
   * Process user login
   */
  async login(user: IUser, loginDto: LoginDto) {
    this.logger.debug('Processing login request', {
      userId: user.id,
      channel: loginDto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    if (!user.allowedChannels.includes(loginDto.channel)) {
      this.logger.warn('Unauthorized channel access attempt', {
        userId: user.id,
        channel: loginDto.channel,
        correlationId: this.correlationService.getCorrelationId(),
      });
      throw new UnauthorizedException('Channel not authorized');
    }

    // Handle 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!loginDto.twoFactorCode) {
        this.logger.debug('2FA required for user', {
          userId: user.id,
          correlationId: this.correlationService.getCorrelationId(),
        });
        return { requiresTwoFactor: true };
      }

      await this.rateLimiterService.consume2FAPoint(`2fa_${user.id}`);
      const isValidToken = await this.twoFactorAuthService.verify2FACode(
        user.id,
        loginDto.twoFactorCode,
      );

      if (!isValidToken) {
        this.logger.warn('Invalid 2FA code provided', {
          userId: user.id,
          correlationId: this.correlationService.getCorrelationId(),
        });
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    // Set up token and session
    const deviceInfo = this.getDeviceInfo(loginDto);
    const sessionId = crypto.randomUUID();
    const tokenFamily = crypto.randomUUID();

    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenManagementService.generateAccessToken(
        user,
        sessionId,
        loginDto.channel,
      ),
      this.tokenManagementService.generateRefreshToken(
        user.id,
        sessionId,
        tokenFamily,
      ),
    ]);

    // Create session
    await this.sessionManagementService.createSession({
      id: sessionId,
      userId: user.id,
      deviceInfo,
      channel: loginDto.channel,
      refreshTokenFamily: tokenFamily,
      userAgent: loginDto.userAgent,
    });

    // Update user's last login timestamp
    await this.userRepository.update(user.id, {
      lastLoginAt: new Date(),
    });

    this.logger.debug('Login successful', {
      userId: user.id,
      sessionId,
      channel: loginDto.channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      sessionId,
      requiresTwoFactor: false,
    };
  }

  /**
   * Process user logout
   */
  async logout(logoutDto: LogoutDto): Promise<void> {
    this.logger.debug('Processing logout request', {
      correlationId: this.correlationService.getCorrelationId(),
    });

    try {
      const decoded = this.tokenManagementService.decodeAndVerifyToken(
        logoutDto.accessToken,
      );

      if (!decoded.sub || !decoded.sessionId) {
        throw new UnauthorizedException('Invalid token');
      }

      // Check if session exists and belongs to user
      const session = await this.sessionManagementService.findSessionById(
        decoded.sessionId,
      );

      if (!session || session.userId !== decoded.sub) {
        throw new UnauthorizedException('Invalid session');
      }

      // Invalidate session
      await this.sessionManagementService.invalidateSession(
        decoded.sessionId,
        'User initiated logout',
      );

      // Clear refresh token (optional)
      await this.userRepository.update(decoded.sub, {
        refreshToken: undefined,
      });

      this.logger.debug('Logout successful', {
        userId: decoded.sub,
        sessionId: decoded.sessionId,
        correlationId: this.correlationService.getCorrelationId(),
      });
    } catch (error) {
      // Handle specific token errors
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * Helper to format device info
   */
  private getDeviceInfo(dto: DeviceInfoDto): string {
    return `${dto.channel}${dto.userAgent ? ` - ${dto.userAgent}` : ''}`;
  }
}
