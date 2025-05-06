import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserPort } from '../../domain/ports/user.port';
import { IUser } from '../../domain/models/user.model';
import { User } from '../entities/user.entity';
import { userStatus } from '../../domain/enums/user_status.enum';
import { AccessLevel } from '../../domain/enums/access-level.enum';
import { USER_REPOSITORY } from 'src/utils/services/constants';

@Injectable()
export class UserRepositoryAdapter implements IUserPort {
  constructor(@Inject(USER_REPOSITORY) private repository: Repository<User>) {}

  async findById(id: string): Promise<IUser | null> {
    const user = await this.repository.findOne({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByIdentifier(identifier: string): Promise<IUser | null> {
    const user = await this.repository.findOne({
      where: [{ email: identifier }, { mobile: identifier }],
    });
    return user ? this.toDomain(user) : null;
  }

  async save(user: Partial<IUser>): Promise<IUser> {
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
    const entity = this.repository.create(user);
    console.log('user creation log 2', entity);
    const savedUser = await this.repository.save(entity);
    console.log('user creation log 3', savedUser);
    return this.toDomain(savedUser);
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser> {
    await this.repository.update(id, user);
    const updatedUser = await this.repository.findOne({ where: { id } });
    if (!updatedUser) {
      throw new Error('User not found');
    }
    return this.toDomain(updatedUser);
  }

  private toDomain(schema: User): IUser {
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
    };
  }
}
