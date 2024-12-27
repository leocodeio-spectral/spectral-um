import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Creator } from './creator.entity';
import { Editor } from '../../../editor/infrastructure/entities/editor.entity';

@Entity('creator_editor_mapping')
export class CreatorEditorMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  creator_id: string;

  @Column({ type: 'uuid' })
  editor_id: string;

  @Column({ type: 'timestamp' })
  create_at: Date;

  @ManyToOne(() => Creator, creator => creator.editor_mappings)
  @JoinColumn({ name: 'creator_id' })
  creator: Creator;

  @ManyToOne(() => Editor, editor => editor.creator_mappings)
  @JoinColumn({ name: 'editor_id' })
  editor: Editor;
} 