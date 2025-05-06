import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IUserPreferencesPort } from '../../domain/ports/user-preferences.port';
import { UserPreferences } from '../entities/user-preferences.entity';
import { IUserPreferences } from '../../domain/models/user-preferences.model';
import { USER_PREFERENCES_REPOSITORY } from 'src/utils/services/constants';

@Injectable()
export class UserPreferencesRepositoryAdapter implements IUserPreferencesPort {
  constructor(
    @Inject(USER_PREFERENCES_REPOSITORY)
    private repository: Repository<UserPreferences>,
  ) {}

  async findByUserId(userId: string): Promise<IUserPreferences | null> {
    const userPreferences = await this.repository.findOne({
      where: { userId },
    });
    return userPreferences ? this.toDomain(userPreferences) : null;
  }

  async save(
    userPreferences: Partial<UserPreferences>,
  ): Promise<IUserPreferences> {
    console.log('user creation log 1', userPreferences);
    const entity = this.repository.create(userPreferences);
    console.log('user creation log 2', entity);
    const savedUserPreferences = await this.repository.save(entity);
    console.log('user creation log 3', savedUserPreferences);
    return this.toDomain(savedUserPreferences);
  }

  async update(
    id: string,
    userPreferences: Partial<UserPreferences>,
  ): Promise<IUserPreferences> {
    await this.repository.update({ userId: id }, userPreferences);
    const updatedUserPreferences = await this.repository.findOne({
      where: { userId: id },
    });
    return this.toDomain(updatedUserPreferences!);
  }

  private toDomain(schema: UserPreferences): IUserPreferences {
    return {
      id: schema.id,
      userId: schema.userId,
      language: schema.language!,
      theme: schema.theme!,
      timeZone: schema.timeZone!,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };
  }
}
