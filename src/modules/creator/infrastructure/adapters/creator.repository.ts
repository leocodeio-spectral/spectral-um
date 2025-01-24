import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Creator } from '../entities/creator.entity';
import { ICreatorRepository } from '../../domain/ports/creator.repository';

@Injectable()
export class CreatorRepository implements ICreatorRepository {
  constructor(
    @InjectRepository(Creator)
    private readonly creatorRepository: Repository<Creator>,
  ) {}
}
