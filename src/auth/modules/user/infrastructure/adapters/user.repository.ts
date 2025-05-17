import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICreatorPort, IEditorPort } from '../../domain/ports/user.port';
import { ICreator, IEditor } from '../../domain/models/user.model';
import { Creator, Editor } from '../entities/user.entity';
import { userStatus } from '../../domain/enums/user_status.enum';
import { AccessLevel } from '../../domain/enums/access-level.enum';
import {
  CREATOR_REPOSITORY,
  EDITOR_REPOSITORY,
} from 'src/auth/libs/services/constants';

@Injectable()
export class CreatorRepositoryAdapter implements ICreatorPort {
  constructor(
    @Inject(CREATOR_REPOSITORY) private creatorRepository: Repository<Creator>,
  ) {}

  async findById(id: string): Promise<ICreator | null> {
    const user = await this.creatorRepository.findOne({ where: { id } });
    return user ? this.toCreatorDomain(user) : null;
  }

  async findByIdentifier(identifier: string): Promise<ICreator | null> {
    const user = await this.creatorRepository.findOne({
      where: [{ email: identifier }, { mobile: identifier }],
    });
    return user ? this.toCreatorDomain(user) : null;
  }

  async save(user: Partial<ICreator>): Promise<ICreator> {
    // save user to the database
    // const user = await manager.save(User, {
    //   email: dto.email,
    //   mobile: dto.mobile,
    //   firstName: dto.firstName,
    //   lastName: dto.lastName,
    //   profilePicUrl: dto.profilePicUrl,
    //   passwordHash,
    //   status: userStatus.ACTIVE,
    //   allowedChannels: ['mobile', 'web'],
    //   accessLevel: accessLevel,
    //   twoFactorEnabled: false,
    // });

    // save user preferences to the database
    // const userPreferences = await manager.save(UserPreferences, {
    //   userId: user.id,
    //   language: dto.language,
    //   theme: dto.theme,
    //   timeZone: dto.timeZone,
    // });
    console.log('user creation log 1', user);
    const entity = this.creatorRepository.create(user);
    console.log('user creation log 2', entity);
    const savedUser = await this.creatorRepository.save(entity);
    console.log('user creation log 3', savedUser);
    return this.toCreatorDomain(savedUser);
  }

  async update(id: string, user: Partial<ICreator>): Promise<ICreator> {
    await this.creatorRepository.update(id, user);
    const updatedUser = await this.creatorRepository.findOne({ where: { id } });
    console.log('user update log 1', updatedUser);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return this.toCreatorDomain(updatedUser);
  }

  private toCreatorDomain(schema: Creator): ICreator {
    return {
      id: schema.id,
      email: schema.email,
      mobile: schema.mobile,
      passwordHash: schema.passwordHash,
      firstName: schema.firstName,
      lastName: schema.lastName,
      profilePicUrl: schema.profilePicUrl,
      status: schema.status as userStatus,
      deletedAt: schema.deletedAt,
      twoFactorSecret: schema.twoFactorSecret,
      twoFactorEnabled: schema.twoFactorEnabled,
      lastLoginAt: schema.lastLoginAt,
      allowedChannels: schema.allowedChannels,
      accessLevel: schema.accessLevel as AccessLevel,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      role: 'creator',
    };
  }
}

@Injectable()
export class EditorRepositoryAdapter implements IEditorPort {
  constructor(
    @Inject(EDITOR_REPOSITORY) private editorRepository: Repository<Editor>,
  ) {}

  async findById(id: string): Promise<IEditor | null> {
    const user = await this.editorRepository.findOne({ where: { id } });
    return user ? this.toEditorDomain(user) : null;
  }

  async findByIdentifier(identifier: string): Promise<IEditor | null> {
    const user = await this.editorRepository.findOne({
      where: [{ email: identifier }, { mobile: identifier }],
    });
    return user ? this.toEditorDomain(user) : null;
  }

  async save(user: Partial<IEditor>): Promise<IEditor> {
    // save user to the database
    // const user = await manager.save(User, {
    //   email: dto.email,
    //   mobile: dto.mobile,
    //   firstName: dto.firstName,
    //   lastName: dto.lastName,
    //   profilePicUrl: dto.profilePicUrl,
    //   passwordHash,
    //   status: userStatus.ACTIVE,
    //   allowedChannels: ['mobile', 'web'],
    //   accessLevel: accessLevel,
    //   twoFactorEnabled: false,
    // });

    // save user preferences to the database
    // const userPreferences = await manager.save(UserPreferences, {
    //   userId: user.id,
    //   language: dto.language,
    //   theme: dto.theme,
    //   timeZone: dto.timeZone,
    // });
    console.log('user creation log 1', user);
    const entity = this.editorRepository.create(user);
    console.log('user creation log 2', entity);
    const savedUser = await this.editorRepository.save(entity);
    console.log('user creation log 3', savedUser);
    return this.toEditorDomain(savedUser);
  }

  async update(id: string, user: Partial<IEditor>): Promise<IEditor> {
    console.log('user update log 0', user);
    console.log('user update log 1', id);
    const userToUpdate = await this.editorRepository.findOne({
      where: { id },
    });
    console.log('user update log 2', userToUpdate);
    await this.editorRepository.update(id, {
      ...userToUpdate,
      ...user,
    });
    const updatedUser = await this.editorRepository.findOne({ where: { id } });
    console.log('user update log 4', updatedUser);
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return this.toEditorDomain(updatedUser);
  }

  private toEditorDomain(schema: Editor): IEditor {
    return {
      id: schema.id,
      email: schema.email,
      mobile: schema.mobile,
      passwordHash: schema.passwordHash,
      firstName: schema.firstName,
      lastName: schema.lastName,
      profilePicUrl: schema.profilePicUrl,
      status: schema.status as userStatus,
      deletedAt: schema.deletedAt,
      twoFactorSecret: schema.twoFactorSecret,
      twoFactorEnabled: schema.twoFactorEnabled,
      lastLoginAt: schema.lastLoginAt,
      allowedChannels: schema.allowedChannels,
      accessLevel: schema.accessLevel as AccessLevel,
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
      role: 'editor',
    };
  }
}
