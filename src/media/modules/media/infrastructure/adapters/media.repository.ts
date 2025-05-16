import { Injectable, NotFoundException } from '@nestjs/common';
import { IMediaPort } from '../../domain/ports/media.port';
import { IMedia } from '../../domain/models/media.port';
import { DataSource } from 'typeorm';
import { Media } from '../entities/media.entity';
import { S3Service } from '../../../../libs/s3/application/services/s3.service';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';

@Injectable()
export class MediaRepositoryAdapter implements IMediaPort {
  constructor(
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<IMedia[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.find(Media);
      await queryRunner.commitTransaction();
      return result.map((media) => this.toDomain(media));
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: string): Promise<IMedia | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      const result = await manager.findOne(Media, {
        where: { id },
      });
      await queryRunner.commitTransaction();
      return result ? this.toDomain(result) : null;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async save(
    media: Partial<IMedia>,
    file: Express.Multer.File,
  ): Promise<IMedia> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      // save to s3
      const fileName =
        new Date().toISOString() +
        file.originalname +
        randomUUID() +
        '.' +
        file.mimetype.split('/')[1];
      const s3result = await this.s3Service.uploadFile({
        file,
        bucketName: this.configService.getOrThrow('AWS_S3_BUCKET_NAME'),
        folder: this.configService.getOrThrow('AWS_S3_FOLDER_NAME'),
        fileName,
      });
      media.integrationUrl = s3result.url;
      media.integrationKey = s3result.key;
      // save to db
      const result = await manager.save(Media, media);
      await queryRunner.commitTransaction();
      return this.toDomain(result);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: string, media: Partial<IMedia>): Promise<IMedia | null> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const manager = queryRunner.manager;
      await manager.update(Media, id, media);
      await queryRunner.commitTransaction();
      const updatedResult = await manager.findOne(Media, {
        where: { id },
      });
      return updatedResult ? this.toDomain(updatedResult) : null;
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
      const media = await manager.findOne(Media, {
        where: { id },
      });
      if (!media) {
        throw new NotFoundException('Media not found');
      }
      if (media.integrationKey) {
        await this.s3Service.deleteFile(
          media.integrationKey,
          this.configService.getOrThrow('AWS_S3_BUCKET_NAME'),
        );
      }
      await manager.delete(Media, id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  toDomain(media: Media): IMedia {
    return {
      id: media.id,
      userId: media.userId,
      accountId: media.accountId,
      type: media.type,
      integrationUrl: media.integrationUrl ? media.integrationUrl : null,
      integrationKey: media.integrationKey ? media.integrationKey : null,
      createdAt: media.createdAt,
      updatedAt: media.updatedAt,
    };
  }

  toEntity(media: IMedia): Media {
    return {
      id: media.id,
      userId: media.userId,
      accountId: media.accountId,
      type: media.type,
      integrationUrl: media.integrationUrl ? media.integrationUrl : null,
      integrationKey: media.integrationKey ? media.integrationKey : null,
      createdAt: media.createdAt || new Date(),
      updatedAt: media.updatedAt || new Date(),
    };
  }
}
