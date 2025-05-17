import { Injectable } from '@nestjs/common';
import { IMedia } from '../../domain/models/media.port';
import { IMediaPort } from '../../domain/ports/media.port';

@Injectable()
export class MediaService {
  constructor(private readonly mediaPort: IMediaPort) {}

  findAll(): Promise<IMedia[]> {
    return this.mediaPort.findAll();
  }

  findById(id: string): Promise<IMedia | null> {
    return this.mediaPort.findById(id);
  }

  create(media: Partial<IMedia>, file: Express.Multer.File): Promise<IMedia> {
    return this.mediaPort.save(media, file);
  }

  update(id: string, media: Partial<IMedia>): Promise<IMedia | null> {
    return this.mediaPort.update(id, media);
  }

  delete(id: string): Promise<void> {
    return this.mediaPort.delete(id);
  }
}
