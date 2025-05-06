export interface TokenPayload {
  sub: string;
  email: string;
  channel: string;
  sessionId: string;
  baseUrl?: string;
  baseMethod?: string;
}
