import { Module } from '@nestjs/common';
import { MediaService } from './application/services/media.service';
import { MediaController } from './presentation/controllers/media.controller';
import { IMediaPort } from './domain/ports/media.port';
import { MediaRepositoryAdapter } from './infrastructure/adapters/media.repository';
import { S3Module } from 'src/media/libs/s3/s3.module';

@Module({
  imports: [S3Module],
  controllers: [MediaController],
  providers: [
    MediaService,
    {
      provide: IMediaPort,
      useClass: MediaRepositoryAdapter,
    },
  ],
})
export class MediaModule {}
