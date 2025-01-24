import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { ICreatorRepository } from '../../domain/ports/creator.repository';

@Injectable()
export class CreatorService {
  constructor(private readonly creatorRepository: ICreatorRepository) {}
}
