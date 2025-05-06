import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { CorrelationService, LoggerService } from '@leocodeio-njs/njs-logging';
import { ISessionPort } from '../../domain/ports/session.port';
import { ISession } from '../../domain/models/session.model';

@Injectable()
export class SessionManagementService {
  constructor(
    private readonly sessionRepository: ISessionPort,
    private readonly logger: LoggerService,
    private readonly correlationService: CorrelationService,
  ) {
    this.logger.setLogContext('SessionManagementService');
  }

  /**
   * Create a new user session
   */
  async createSession(sessionData: {
    id?: string;
    userId: string;
    deviceInfo: string;
    channel: string;
    refreshTokenFamily: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): Promise<ISession | null> {
    const sessionId = sessionData.id || crypto.randomUUID();

    this.logger.debug('Creating new session', {
      userId: sessionData.userId,
      channel: sessionData.channel,
      sessionId,
      correlationId: this.correlationService.getCorrelationId(),
    });

    await this.sessionRepository.create({
      id: sessionId,
      userId: sessionData.userId,
      deviceInfo: sessionData.deviceInfo,
      lastActive: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      isRevoked: false,
      refreshTokenFamily: sessionData.refreshTokenFamily,
      tokenVersion: 1,
      refreshCount: 0,
      metadata: {
        ...(sessionData.metadata || {}),
        userAgent: sessionData.userAgent,
        channel: sessionData.channel,
        lastTokenRefresh: new Date(),
      },
    });

    return this.sessionRepository.findSessionById(sessionId);
  }

  /**
   * Invalidate a session (e.g., on logout)
   */
  async invalidateSession(sessionId: string, reason: string): Promise<void> {
    this.logger.debug('Invalidating session', {
      sessionId,
      reason,
      correlationId: this.correlationService.getCorrelationId(),
    });

    await this.sessionRepository.invalidate(sessionId, reason);
  }

  /**
   * Invalidate all sessions for a user
   */
  async invalidateAllUserSessions(
    userId: string,
    reason: string,
  ): Promise<void> {
    this.logger.debug('Invalidating all user sessions', {
      userId,
      reason,
      correlationId: this.correlationService.getCorrelationId(),
    });

    await this.sessionRepository.invalidateAllUserSessions(userId, reason);
  }

  /**
   * Check if a session is valid
   */
  async isSessionValid(sessionId: string): Promise<boolean> {
    return this.sessionRepository.isValid(sessionId);
  }

  /**
   * Find a session by its ID
   */
  async findSessionById(sessionId: string): Promise<ISession | null> {
    return this.sessionRepository.findSessionById(sessionId);
  }

  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId: string): Promise<ISession[]> {
    return this.sessionRepository.getUserActiveSessions(userId);
  }

  /**
   * Update session after token refresh
   */
  async updateSessionAfterRefresh(
    sessionId: string,
    tokenVersion: number,
  ): Promise<void> {
    this.logger.debug('Updating session after token refresh', {
      sessionId,
      newTokenVersion: tokenVersion + 1,
      correlationId: this.correlationService.getCorrelationId(),
    });

    const session = await this.sessionRepository.findSessionById(sessionId);
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    await this.sessionRepository.update(sessionId, {
      tokenVersion: tokenVersion + 1,
      lastRefreshAt: new Date(),
      refreshCount: session.refreshCount + 1,
      metadata: {
        ...session.metadata,
        lastTokenRefresh: new Date(),
      },
    });
  }

  /**
   * Clean up expired sessions (can be called periodically)
   */
  async cleanupExpiredSessions(): Promise<void> {
    this.logger.debug('Cleaning up expired sessions', {
      correlationId: this.correlationService.getCorrelationId(),
    });

    await this.sessionRepository.cleanupExpiredSessions();
  }
}
