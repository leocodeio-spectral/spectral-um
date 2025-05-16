import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from 'src/auth/utils/types/token';
import { ISessionPort } from 'src/auth/modules/session/domain/ports/session.port';

@Injectable()
export class CreatorJwtStrategy extends PassportStrategy(
  Strategy,
  'creator-jwt',
) {
  constructor(
    private readonly sessionRepository: ISessionPort,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    console.log('JWT Strategy - Received payload:', payload);
    try {
      const isValidSession = await this.sessionRepository.isValid(
        payload.sessionId,
      );
      console.log('JWT Strategy - Session valid:', isValidSession);
      if (!isValidSession) {
        throw new UnauthorizedException('Session expired');
      }

      return {
        id: payload.sub,
        email: payload.email,
        sessionId: payload.sessionId,
        baseUrl: payload.baseUrl,
        baseMethod: payload.baseMethod,
      };
    } catch (error) {
      console.log('JWT Strategy - Validation error:', error);
      throw new UnauthorizedException(error.message);
    }
  }
}

@Injectable()
export class EditorJwtStrategy extends PassportStrategy(
  Strategy,
  'editor-jwt',
) {
  constructor(
    private readonly sessionRepository: ISessionPort,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: TokenPayload) {
    console.log('JWT Strategy - Received payload:', payload);
    try {
      const isValidSession = await this.sessionRepository.isValid(
        payload.sessionId,
      );
      console.log('JWT Strategy - Session valid:', isValidSession);
      if (!isValidSession) {
        throw new UnauthorizedException('Session expired');
      }

      return {
        id: payload.sub,
        email: payload.email,
        sessionId: payload.sessionId,
        baseUrl: payload.baseUrl,
        baseMethod: payload.baseMethod,
      };
    } catch (error) {
      console.log('JWT Strategy - Validation error:', error);
      throw new UnauthorizedException(error.message);
    }
  }
}
