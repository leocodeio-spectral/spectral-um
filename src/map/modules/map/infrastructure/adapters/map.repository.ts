import { Injectable, NotFoundException } from '@nestjs/common';
// creator editor
import { ICreatorEditorMap } from '../../domain/models/creator-editor-map.model';
import { ICreatorEditorMapPort } from '../../domain/ports/creator-editor-map.port';
import { DataSource } from 'typeorm';
import { CreatorEditorMap } from '../entities/creator-editor-map.entity';

// account editor
import { IAccountEditorMap } from '../../domain/models/account-editor-map.model';
import { IAccountEditorMapPort } from '../../domain/ports/account-editor-map.port';
import { AccountEditorMap } from '../entities/account-editor-map.entity';

@Injectable()
export class CreatorEditorMapRepositoryAdapter
  implements ICreatorEditorMapPort
{
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<ICreatorEditorMap[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.find(CreatorEditorMap);
      await queryRunner.commitTransaction();
      return result.map((creatorEditorMap) =>
        this.toCreatorEditorMapDomain(creatorEditorMap),
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: string): Promise<ICreatorEditorMap | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.findOne(CreatorEditorMap, {
        where: { id },
      });
      await queryRunner.commitTransaction();
      return result ? this.toCreatorEditorMapDomain(result) : null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByCreatorId(creatorId: string): Promise<ICreatorEditorMap[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.find(CreatorEditorMap, {
        where: { creatorId },
      });
      await queryRunner.commitTransaction();
      return result
        ? result.map((creatorEditorMap) =>
            this.toCreatorEditorMapDomain(creatorEditorMap),
          )
        : [];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByEditorId(editorId: string): Promise<ICreatorEditorMap[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.find(CreatorEditorMap, {
        where: { editorId },
      });
      await queryRunner.commitTransaction();
      return result
        ? result.map((creatorEditorMap) =>
            this.toCreatorEditorMapDomain(creatorEditorMap),
          )
        : [];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async save(
    creatorEditorMap: Partial<ICreatorEditorMap>,
  ): Promise<ICreatorEditorMap> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.save(CreatorEditorMap, creatorEditorMap);
      await queryRunner.commitTransaction();
      return this.toCreatorEditorMapDomain(result);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    creatorEditorMap: Partial<ICreatorEditorMap>,
  ): Promise<ICreatorEditorMap | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      await manager.update(CreatorEditorMap, id, creatorEditorMap);
      await queryRunner.commitTransaction();
      const updatedResult = await manager.findOne(CreatorEditorMap, {
        where: { id },
      });
      return updatedResult
        ? this.toCreatorEditorMapDomain(updatedResult)
        : null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const creatorEditorMap = await manager.findOne(CreatorEditorMap, {
        where: { id },
      });
      if (!creatorEditorMap) {
        throw new NotFoundException('CreatorEditorMap not found');
      }
      await manager.delete(CreatorEditorMap, id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  toCreatorEditorMapDomain(
    creatorEditorMap: CreatorEditorMap,
  ): ICreatorEditorMap {
    return {
      id: creatorEditorMap.id,
      creatorId: creatorEditorMap.creatorId,
      editorId: creatorEditorMap.editorId,
      status: creatorEditorMap.status,
      createdAt: creatorEditorMap.createdAt,
      updatedAt: creatorEditorMap.updatedAt,
    };
  }

  toCreatorEditorMapEntity(
    creatorEditorMap: ICreatorEditorMap,
  ): CreatorEditorMap {
    return {
      id: creatorEditorMap.id,
      creatorId: creatorEditorMap.creatorId,
      editorId: creatorEditorMap.editorId,
      status: creatorEditorMap.status,
      createdAt: creatorEditorMap.createdAt || new Date(),
      updatedAt: creatorEditorMap.updatedAt || new Date(),
    };
  }
}

@Injectable()
export class AccountEditorMapRepositoryAdapter
  implements IAccountEditorMapPort
{
  constructor(private readonly dataSource: DataSource) {}

  async findAll(): Promise<IAccountEditorMap[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.find(AccountEditorMap);
      await queryRunner.commitTransaction();
      return result.map((accountEditorMap) =>
        this.toAccountEditorMapDomain(accountEditorMap),
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: string): Promise<IAccountEditorMap | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.findOne(AccountEditorMap, {
        where: { id },
      });
      await queryRunner.commitTransaction();
      return result ? this.toAccountEditorMapDomain(result) : null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByAccountId(accountId: string): Promise<IAccountEditorMap[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.find(AccountEditorMap, {
        where: { accountId },
      });
      await queryRunner.commitTransaction();
      return result
        ? result.map((accountEditorMap) =>
            this.toAccountEditorMapDomain(accountEditorMap),
          )
        : [];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByEditorId(editorId: string): Promise<IAccountEditorMap[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.find(AccountEditorMap, {
        where: { editorId },
      });
      await queryRunner.commitTransaction();
      return result
        ? result.map((accountEditorMap) =>
            this.toAccountEditorMapDomain(accountEditorMap),
          )
        : [];
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async save(
    accountEditorMap: Partial<IAccountEditorMap>,
  ): Promise<IAccountEditorMap> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.save(AccountEditorMap, accountEditorMap);
      await queryRunner.commitTransaction();
      return this.toAccountEditorMapDomain(result);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(
    id: string,
    accountEditorMap: Partial<IAccountEditorMap>,
  ): Promise<IAccountEditorMap | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      await manager.update(AccountEditorMap, id, accountEditorMap);
      await queryRunner.commitTransaction();
      const updatedResult = await manager.findOne(AccountEditorMap, {
        where: { id },
      });
      return updatedResult
        ? this.toAccountEditorMapDomain(updatedResult)
        : null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const accountEditorMap = await manager.findOne(AccountEditorMap, {
        where: { id },
      });
      if (!accountEditorMap) {
        throw new NotFoundException('AccountEditorMap not found');
      }
      await manager.delete(AccountEditorMap, id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  toAccountEditorMapDomain(
    accountEditorMap: AccountEditorMap,
  ): IAccountEditorMap {
    return {
      id: accountEditorMap.id,
      accountId: accountEditorMap.accountId,
      editorId: accountEditorMap.editorId,
      status: accountEditorMap.status,
      createdAt: accountEditorMap.createdAt,
      updatedAt: accountEditorMap.updatedAt,
    };
  }

  toAccountEditorMapEntity(
    accountEditorMap: IAccountEditorMap,
  ): AccountEditorMap {
    return {
      id: accountEditorMap.id,
      accountId: accountEditorMap.accountId,
      editorId: accountEditorMap.editorId,
      status: accountEditorMap.status,
      createdAt: accountEditorMap.createdAt || new Date(),
      updatedAt: accountEditorMap.updatedAt || new Date(),
    };
  }
}
