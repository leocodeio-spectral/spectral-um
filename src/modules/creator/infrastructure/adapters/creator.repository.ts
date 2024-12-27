import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Creator } from '../entities/creator.entity';
import { ICreatorRepository } from '../../domain/ports/creator-repository.interface';

@Injectable()
export class CreatorRepository implements ICreatorRepository {
  constructor(
    @InjectRepository(Creator)
    private readonly creatorRepository: Repository<Creator>,
  ) {}

  async findByEmail(email: string): Promise<Creator | null> {
    return this.creatorRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'first_name', 'last_name', 'profile_pic_url'] // Added profile_pic_url
    });
  }

  async create(creator: Partial<Creator>): Promise<Creator> {
    const newCreator = this.creatorRepository.create(creator);
    return this.creatorRepository.save(newCreator);
  }

  async findById(id: string): Promise<Creator | null> {
    return this.creatorRepository.findOne({ where: { id } });
  }
} 