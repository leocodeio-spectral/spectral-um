import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CreatorEditorMapStatus } from '../../domain/enums/creator-editor-map-status.enum';

@Entity('creator_editor_map')
export class CreatorEditorMap {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'creator_id', type: 'uuid' })
  creatorId: string;

  @Column({ name: 'editor_id', type: 'uuid' })
  editorId: string;

  @Column({
    type: 'enum',
    enum: CreatorEditorMapStatus,
    default: CreatorEditorMapStatus.ACTIVE,
  })
  status: CreatorEditorMapStatus;

  @Column({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
