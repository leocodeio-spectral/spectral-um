import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { userStatus } from '../../domain/enums/user_status.enum';
import { AccessLevel } from '../../domain/enums/access-level.enum';

@Entity('creators')
export class Creator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  mobile?: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'text', nullable: true })
  firstName: string;

  @Column({ type: 'text', nullable: true })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  profilePicUrl?: string;

  @Column({
    name: 'status',
    type: 'text',
    enum: userStatus,
    default: userStatus.ACTIVE,
  })
  status?: userStatus;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
  deletedAt: Date;

  @Column({ nullable: true })
  twoFactorSecret?: string;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column('simple-array')
  allowedChannels: string[];

  @Column({
    type: 'text',
    enum: AccessLevel,
    default: AccessLevel.NONE,
    enumName: 'access_level',
  })
  accessLevel: AccessLevel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column('simple-array', { nullable: true })
  backupCodes?: string[];

  @Column({ type: 'text', nullable: false, default: 'creator' })
  role: 'creator';
}

@Entity('editors')
export class Editor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, unique: true })
  mobile?: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'text', nullable: true })
  firstName: string;

  @Column({ type: 'text', nullable: true })
  lastName: string;

  @Column({ type: 'text', nullable: true })
  profilePicUrl?: string;

  @Column({
    name: 'status',
    type: 'text',
    enum: userStatus,
    default: userStatus.ACTIVE,
  })
  status?: userStatus;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
  deletedAt: Date;

  @Column({ nullable: true })
  twoFactorSecret?: string;

  @Column({ default: false })
  twoFactorEnabled: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column('simple-array')
  allowedChannels: string[];

  @Column({
    type: 'text',
    enum: AccessLevel,
    default: AccessLevel.NONE,
    enumName: 'access_level',
  })
  accessLevel: AccessLevel;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column('simple-array', { nullable: true })
  backupCodes?: string[];

  @Column({ type: 'text', nullable: false, default: 'editor' })
  role: 'editor';
}
