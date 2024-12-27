import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { CreatorEditorMapping } from '../../../creator/infrastructure/entities/creator-editor-mapping.entity';
import { EditorAuditLog } from './editor-audit-log.entity';
import { EditorHistory } from './editor-history.entity';

@Entity('editor')
export class Editor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  first_name: string;

  @Column({ type: 'varchar' })
  last_name: string;

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'varchar', nullable: true })
  profile_pic_url: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @OneToMany(() => EditorAuditLog, auditLog => auditLog.editor)
  audit_logs: EditorAuditLog[];

  @OneToMany(() => EditorHistory, history => history.editor)
  history: EditorHistory[];

  @OneToMany(() => CreatorEditorMapping, mapping => mapping.editor)
  creator_mappings: CreatorEditorMapping[];
} 