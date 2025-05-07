// import { user_status } from 'src/auth/domain/enums/user_status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Creator, Editor } from './user.entity';

@Entity('creator_preferences')
export class CreatorPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ManyToOne(() => Creator, (user) => user.id)
  creatorId: string;

  @Column({ type: 'text', default: 'en' })
  language?: string;

  @Column({ type: 'text', default: 'dark' })
  theme?: string;

  @Column({ type: 'text', default: 'UTC' })
  timeZone?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}



@Entity('editor_preferences')
export class EditorPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ManyToOne(() => Editor, (user) => user.id)
  editorId: string;

  @Column({ type: 'text', default: 'en' })
  language?: string;

  @Column({ type: 'text', default: 'dark' })
  theme?: string;

  @Column({ type: 'text', default: 'UTC' })
  timeZone?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}