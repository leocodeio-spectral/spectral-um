import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Creator } from './creator.entity';

@Entity('creator_history')
export class CreatorHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  creator_id: string;

  @Column({ 
    type: 'enum',
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED']
  })
  status: string;

  @Column({ type: 'varchar' })
  reason: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Creator, creator => creator.history)
  @JoinColumn({ name: 'creator_id' })
  creator: Creator;
} 