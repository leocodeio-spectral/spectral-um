import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Editor } from './editor.entity';

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

@Entity('editor_history')
export class EditorHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  creator_id: string;

  @Column({ type: 'enum', enum: Status })
  status: Status;

  @Column({ type: 'varchar' })
  reason: string;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Editor, editor => editor.history)
  editor: Editor;
} 