import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MediaType } from '../../domain/enums/media-type.enum';

@Entity()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column()
  type: MediaType;

  @Column({ type: 'varchar', nullable: true })
  integrationUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  integrationKey: string | null;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
