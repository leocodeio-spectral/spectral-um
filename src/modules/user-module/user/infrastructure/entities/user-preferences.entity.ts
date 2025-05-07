// import { user_status } from 'src/auth/domain/enums/user_status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('users_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @ManyToOne(() => User, (user) => user.id)
  userId: string;

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
