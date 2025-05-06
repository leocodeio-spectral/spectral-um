import { ISession } from '../models/session.model';

export abstract class ISessionPort {
  abstract create(session: ISession): Promise<void>;
  abstract invalidate(sessionId: string, reason: string): Promise<void>;
  abstract invalidateAllUserSessions(
    userId: string,
    reason: string,
  ): Promise<void>;
  abstract isValid(sessionId: string): Promise<boolean>;
  abstract findSessionById(sessionId: string): Promise<ISession | null>;
  abstract cleanupExpiredSessions(): Promise<void>;
  abstract getUserActiveSessions(userId: string): Promise<ISession[]>;
  abstract update(sessionId: string, updates: Partial<ISession>): Promise<void>;
}
