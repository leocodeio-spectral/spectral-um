import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Creator } from './creator.entity';

@Entity('creator_access_tokens')
export class CreatorAccessToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  creator_id: string;

  @Column({ type: 'text' })
  yt_access_token: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Creator, creator => creator.access_tokens)
  @JoinColumn({ name: 'creator_id' })
  creator: Creator;
} 