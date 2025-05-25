import { IYtCreatorEntity } from '../../domain/models/yt-creator.model';
import { IYtCreatorRepository } from '../../domain/ports/yt-creator.repository';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { YtCreatorEntity } from '../entities/yt-creator.entity';
import { GetCreatorEntryModel } from '../../domain/enums/get-creator-entry.model';

@Injectable()
export class YtCreatorRepository implements IYtCreatorRepository {
  constructor(
    @InjectRepository(YtCreatorEntity)
    private readonly ytCreatorRepository: Repository<YtCreatorEntity>,
  ) {}

  async find(
    query: GetCreatorEntryModel,
  ): Promise<Partial<IYtCreatorEntity>[]> {
    const creators = await this.ytCreatorRepository.find({ where: query });
    return creators.map((creator) => this.toDomain(creator));
  }

  async save(creator: IYtCreatorEntity): Promise<IYtCreatorEntity> {
    return this.ytCreatorRepository.save(creator);
  }

  async delete(id: string): Promise<void> {
    await this.ytCreatorRepository.delete(id);
  }

  async findByEmail(email: string): Promise<YtCreatorEntity | null> {
    return this.ytCreatorRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<YtCreatorEntity | null> {
    return this.ytCreatorRepository.findOneBy({ id });
  }

  toDomain(creator: YtCreatorEntity): Partial<IYtCreatorEntity> {
    return {
      id: creator.id,
      creatorId: creator.creatorId,
      status: creator.status,
      email: creator.email,
    };
  }
}
