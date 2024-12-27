import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Editor } from './editor.entity';

export enum Operation {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

@Entity('editor_audit_logs')
export class EditorAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  creator_id: string;

  @Column({ type: 'enum', enum: Operation })
  operation: Operation;

  @Column({ type: 'jsonb' })
  old_values: Record<string, any>;

  @Column({ type: 'jsonb' })
  new_values: Record<string, any>;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @ManyToOne(() => Editor, editor => editor.audit_logs)
  editor: Editor;
} 