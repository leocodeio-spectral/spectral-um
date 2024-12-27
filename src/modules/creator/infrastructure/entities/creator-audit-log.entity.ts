import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Creator } from './creator.entity';

@Entity('creator_audit_logs')
export class CreatorAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  creator_id: string;

  @Column({ 
    type: 'enum',
    enum: ['CREATE', 'UPDATE', 'DELETE']
  })
  operation: string;

  @Column({ type: 'jsonb', nullable: true })
  old_values: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  new_values: Record<string, any>;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Creator, creator => creator.audit_logs)
  @JoinColumn({ name: 'creator_id' })
  creator: Creator;
} 