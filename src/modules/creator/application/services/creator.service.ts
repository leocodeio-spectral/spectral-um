import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreatorRepository } from '../../infrastructure/adapters/creator.repository';

@Injectable()
export class CreatorService {
  constructor(
    private readonly creatorRepository: CreatorRepository,
    private readonly jwtService: JwtService,
  ) {}
}
