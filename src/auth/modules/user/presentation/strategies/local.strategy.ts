import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  CreatorAuthService,
  EditorAuthService,
} from '../../application/services/auth.service';

@Injectable()
export class CreatorLocalStrategy extends PassportStrategy(
  Strategy,
  'creator-local',
) {
  constructor(private authService: CreatorAuthService) {
    super({
      usernameField: 'identifier', // Can be email or mobile
    });
  }

  async validate(identifier: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(identifier, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

@Injectable()
export class EditorLocalStrategy extends PassportStrategy(
  Strategy,
  'editor-local',
) {
  constructor(private authService: EditorAuthService) {
    super({
      usernameField: 'identifier', // Can be email or mobile
    });
  }

  async validate(identifier: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(identifier, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
