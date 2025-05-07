import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  ICreatorPreferencesPort,
  IEditorPreferencesPort,
} from '../../domain/ports/user-preferences.port';
import {
  CreatorPreferences,
  EditorPreferences,
} from '../entities/user-preferences.entity';
import {
  ICreatorPreferences,
  IEditorPreferences,
} from '../../domain/models/user-preferences.model';
import {
  CREATOR_PREFERENCES_REPOSITORY,
  EDITOR_PREFERENCES_REPOSITORY,
} from 'src/utils/services/constants';

@Injectable()
export class CreatorPreferencesRepositoryAdapter
  implements ICreatorPreferencesPort
{
  constructor(
    @Inject(CREATOR_PREFERENCES_REPOSITORY)
    private repository: Repository<CreatorPreferences>,
  ) {}

  async findByUserId(userId: string): Promise<ICreatorPreferences | null> {
    const userPreferences = await this.repository.findOne({
      where: { creatorId: userId },
    });
    return userPreferences ? this.toDomain(userPreferences) : null;
  }

  async save(
    userPreferences: Partial<CreatorPreferences>,
  ): Promise<ICreatorPreferences> {
    console.log('user creation log 1', userPreferences);
    const entity = this.repository.create(userPreferences);
    console.log('user creation log 2', entity);
    const savedUserPreferences = await this.repository.save(entity);
    console.log('user creation log 3', savedUserPreferences);
    return this.toDomain(savedUserPreferences);
  }

  async update(
    id: string,
    userPreferences: Partial<CreatorPreferences>,
  ): Promise<ICreatorPreferences> {
    await this.repository.update({ creatorId: id }, userPreferences);
    const updatedUserPreferences = await this.repository.findOne({
      where: { creatorId: id },
    });
    return this.toDomain(updatedUserPreferences!);
  }

  private toDomain(schema: CreatorPreferences): ICreatorPreferences {
    return {
      id: schema.id,
      userId: schema.creatorId,
      language: schema.language!,
      theme: schema.theme!,
      timeZone: schema.timeZone!,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };
  }
}

@Injectable()
export class EditorPreferencesRepositoryAdapter
  implements IEditorPreferencesPort
{
  constructor(
    @Inject(EDITOR_PREFERENCES_REPOSITORY)
    private repository: Repository<EditorPreferences>,
  ) {}

  async findByUserId(userId: string): Promise<IEditorPreferences | null> {
    const userPreferences = await this.repository.findOne({
      where: { editorId: userId },
    });
    return userPreferences ? this.toDomain(userPreferences) : null;
  }

  async save(
    userPreferences: Partial<EditorPreferences>,
  ): Promise<IEditorPreferences> {
    console.log('user creation log 1', userPreferences);
    const entity = this.repository.create(userPreferences);
    console.log('user creation log 2', entity);
    const savedUserPreferences = await this.repository.save(entity);
    console.log('user creation log 3', savedUserPreferences);
    return this.toDomain(savedUserPreferences);
  }

  async update(
    id: string,
    userPreferences: Partial<EditorPreferences>,
  ): Promise<IEditorPreferences> {
    await this.repository.update({ editorId: id }, userPreferences);
    const updatedUserPreferences = await this.repository.findOne({
      where: { editorId: id },
    });
    return this.toDomain(updatedUserPreferences!);
  }

  private toDomain(schema: EditorPreferences): IEditorPreferences {
    return {
      id: schema.id,
      userId: schema.editorId,
      language: schema.language!,
      theme: schema.theme!,
      timeZone: schema.timeZone!,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };
  }
}
