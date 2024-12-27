import { Creator } from '../../infrastructure/entities/creator.entity';

export interface ICreatorRepository {
  findByEmail(email: string): Promise<Creator | null>;
  create(creator: Partial<Creator>): Promise<Creator>;
  findById(id: string): Promise<Creator | null>;
} 