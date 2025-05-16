import { IMedia } from '../models/media.port';

export abstract class IMediaPort {
  abstract findAll(): Promise<IMedia[]>;
  abstract findById(id: string): Promise<IMedia | null>;
  abstract save(media: Partial<IMedia>, file: Express.Multer.File): Promise<IMedia>;
  abstract update(id: string, media: Partial<IMedia>): Promise<IMedia | null>;
  abstract delete(id: string): Promise<void>;
}
