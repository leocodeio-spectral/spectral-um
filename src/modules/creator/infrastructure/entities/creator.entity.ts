import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CreatorAuditLog } from './creator-audit-log.entity';
import { CreatorHistory } from './creator-history.entity';
import { CreatorAccessToken } from './creator-access-token.entity';
import { CreatorEditorMapping } from './creator-editor-mapping.entity';


@Entity('creator')
export class Creator {
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

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  profile_pic_url: string;

  @Column({ type: 'boolean', default: true })
  status: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deleted_at: Date;

  @Column({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @OneToMany(() => CreatorAuditLog, auditLog => auditLog.creator)
  audit_logs: CreatorAuditLog[];

  @OneToMany(() => CreatorHistory, history => history.creator)
  history: CreatorHistory[];

  @OneToMany(() => CreatorAccessToken, accessToken => accessToken.creator)
  access_tokens: CreatorAccessToken[];

  @OneToMany(() => CreatorEditorMapping, mapping => mapping.creator)
  editor_mappings: CreatorEditorMapping[];
} 