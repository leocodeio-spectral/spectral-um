import {
  Injectable,
  Inject,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { SessionManagementService } from './session-management.service';
import { ISessionPort } from 'src/modules/session/domain/ports/session.port';
import { IUserPort } from 'src/modules/user/domain/ports/user.port';
import { CorrelationService, LoggerService } from '@leocodeio-njs/njs-logging';
import { IUser } from 'src/modules/user/domain/models/user.model';
import { AuthPolicyService } from 'src/utils/services/auth-policy.service';
import { TokenPayload } from 'src/utils/types/token';

interface RefreshTokenPayload {
  sub: string;
  tokenFamily: string;
  sessionId: string;
  version: number;
  jti: string;
}

@Injectable()
export class TokenManagementService {
  private refreshTokenLimiter: RateLimiterMemory;

  constructor(
    private readonly userRepository: IUserPort,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly correlationService: CorrelationService,
    private readonly sessionService: SessionManagementService,
    private readonly authPolicyService: AuthPolicyService,
  ) {
    this.logger.setLogContext('TokenManagementService');

    // Initialize refresh token rate limiter
    this.refreshTokenLimiter = new RateLimiterMemory({
      points: this.configService.get('RATE_LIMIT_REFRESH_POINTS') || 5, // 5 attempts
      duration: this.configService.get('RATE_LIMIT_REFRESH_DURATION') || 60, // per 1 minute
      blockDuration: this.configService.get('RATE_LIMIT_REFRESH_BLOCK') || 300, // Block for 5 minutes
    });
  }

  /**
   * Generate an access token for a user
   */
  async generateAccessToken(
    user: IUser,
    sessionId: string,
    channel: string,
  ): Promise<string> {
    this.logger.debug('Generating access token', {
      userId: user.id,
      sessionId,
      channel,
      correlationId: this.correlationService.getCorrelationId(),
    });

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      channel: channel,
      sessionId: sessionId,
    };

    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN') || '1h',
      secret: this.configService.get('JWT_SECRET') || 'default-secret',
    });
  }

  /**
   * Generate a refresh token
   */
  async generateRefreshToken(
    userId: string,
    sessionId: string,
    tokenFamily: string,
    version: number = 1,
  ): Promise<string> {
    this.logger.debug('Generating refresh token', {
      userId,
      sessionId,
      tokenFamily,
      version,
      correlationId: this.correlationService.getCorrelationId(),
    });

    const payload: RefreshTokenPayload = {
      sub: userId,
      tokenFamily,
      sessionId,
      version,
      jti: crypto.randomUUID(),
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret:
        this.configService.get('JWT_REFRESH_SECRET') ||
        this.configService.get('JWT_SECRET'),
    });
  }

  /**
   * Refresh an access token using a refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    sessionId: string;
  }> {
    this.logger.debug('Processing token refresh request', {
      correlationId: this.correlationService.getCorrelationId(),
    });

    try {
      // Apply rate limiting
      const tokenId = this.jwtService.decode(refreshToken)['jti'];
      await this.refreshTokenLimiter.consume(tokenId);

      // Verify the refresh token
      const decoded = this.jwtService.verify<RefreshTokenPayload>(
        refreshToken,
        {
          secret:
            this.configService.get('JWT_REFRESH_SECRET') ||
            this.configService.get('JWT_SECRET'),
        },
      );

      // Get and validate session
      const session = await this.sessionService.findSessionById(
        decoded.sessionId,
      );

      if (!session || session.isRevoked) {
        throw new UnauthorizedException('Invalid session');
      }

      // Verify token family and version
      if (
        session.refreshTokenFamily !== decoded.tokenFamily ||
        session.tokenVersion !== decoded.version
      ) {
        // Potential token reuse - revoke all user sessions
        await this.sessionService.invalidateAllUserSessions(
          decoded.sub,
          'Token reuse detected',
        );
        throw new UnauthorizedException('Security violation detected');
      }

      // Check if session has exceeded maximum refresh count
      if (session.refreshCount >= 1000) {
        // Arbitrary limit
        await this.sessionService.invalidateSession(
          session.id,
          'Maximum refresh count exceeded',
        );
        throw new UnauthorizedException('Session expired');
      }

      // Get user
      const user = await this.userRepository.findById(decoded.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new tokens
      const newAccessToken = await this.generateAccessToken(
        user,
        session.id,
        session.metadata?.channel || 'web',
      );

      // Rotate refresh token
      const newRefreshToken = await this.generateRefreshToken(
        user.id,
        session.id,
        decoded.tokenFamily,
        decoded.version + 1,
      );

      // Update session
      await this.sessionService.updateSessionAfterRefresh(
        session.id,
        decoded.version,
      );

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        sessionId: session.id,
      };
    } catch (error) {
      if (error.name === 'RateLimiterError') {
        throw new HttpException(
          'Too many refresh attempts',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token format');
      }
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw error;
    }
  }

  /**
   * Decode and verify a JWT token
   */
  decodeAndVerifyToken(
    token: string,
    tokenType: 'access' | 'refresh' = 'access',
  ): any {
    try {
      const secret =
        tokenType === 'access'
          ? this.configService.get('JWT_SECRET')
          : this.configService.get('JWT_REFRESH_SECRET') ||
            this.configService.get('JWT_SECRET');

      return this.jwtService.verify(token, { secret });
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`, {
        correlationId: this.correlationService.getCorrelationId(),
      });
      throw new UnauthorizedException(
        error.name === 'TokenExpiredError'
          ? 'Token has expired'
          : 'Invalid token',
      );
    }
  }

  /**
   * Validate a token for a specific channel and client
   */
  async validateToken(
    userId: string,
    channel: string,
    clientId?: string,
    baseUrl?: string,
    baseMethod?: string,
  ): Promise<boolean> {
    this.logger.debug('Validating token authorization', {
      userId,
      channel,
      clientId,
      baseUrl,
      baseMethod,
      correlationId: this.correlationService.getCorrelationId(),
    });

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isTokenUsageValid = this.authPolicyService.isTokenUsageValid(
      user,
      channel,
      clientId,
    );

    const haveAccessToResource = this.authPolicyService.canAccessResource(
      baseUrl,
      user,
      baseMethod,
    );

    this.logger.debug('Token validation result', {
      userId,
      channel,
      clientId,
      baseUrl,
      baseMethod,
      isValid: isTokenUsageValid && haveAccessToResource,
      correlationId: this.correlationService.getCorrelationId(),
    });

    return isTokenUsageValid && haveAccessToResource;
  }

  /**
   * Verify an API client
   */
  // private async verifyApiClient(
  //   clientId: string,
  //   userId: string,
  // ): Promise<boolean> {
  //   this.logger.debug('Verifying API client', {
  //     clientId,
  //     userId,
  //     correlationId: this.correlationService.getCorrelationId(),
  //   });

  //   // TODO: Implement API client verification
  //   const validClients = ['validMicroservice'];
  //   return validClients.includes(clientId);
  // }
}
