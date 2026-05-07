import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type ManagerDifficultyTag = 'easy' | 'medium' | 'hard';
export type ManagerTimeTag = 'XS' | 'S' | 'M' | 'L';
export type ManagerPriorityTag = 'low' | 'normal' | 'high';
export type ManagerLevelTag = 'junior' | 'middle' | 'senior';

export type ManagerTaskStatus = 'published' | 'in_progress' | 'review' | 'done';

@Entity({ name: 'manager_tasks' })
export class ManagerTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index(['managerId'])
  @Column({ type: 'text' })
  managerId!: string;

  @Column({ type: 'text', default: '' })
  team!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  difficulty!: ManagerDifficultyTag;

  @Column({ type: 'text' })
  time!: ManagerTimeTag;

  @Column({ type: 'text' })
  priority!: ManagerPriorityTag;

  @Column({ type: 'text' })
  level!: ManagerLevelTag;

  @Column({ type: 'integer' })
  baseXp!: number;

  @Column({ type: 'text', default: 'published' })
  status!: ManagerTaskStatus;

  @CreateDateColumn()
  createdAt!: Date;
}
