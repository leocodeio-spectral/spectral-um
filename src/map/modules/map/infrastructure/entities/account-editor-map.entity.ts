import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AccountEditorMapStatus } from '../../domain/enums/account-editor-map-status.enum';

@Entity('account_editor_map')
export class AccountEditorMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_id', type: 'uuid' })
  accountId: string;

  @Column({ name: 'editor_id', type: 'uuid' })
  editorId: string;

  @Column({
    type: 'enum',
    enum: AccountEditorMapStatus,
    default: AccountEditorMapStatus.ACTIVE,
  })
  status: AccountEditorMapStatus;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
