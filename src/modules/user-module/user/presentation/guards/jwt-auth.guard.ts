// src/auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard - Attempting to validate token');
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Handle invalid/expired token scenarios
    if (info instanceof Error) {
      if (info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      } else if (info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
    }

    // Handle missing token or other errors
    if (err || !user) {
      throw new UnauthorizedException('Invalid or missing token');
    }

    return user;
  }
}