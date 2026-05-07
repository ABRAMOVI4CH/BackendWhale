import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type XpTransactionTypeDb =
  | 'task_award'
  | 'manual_adjustment'
  | 'grade_up';

@Entity({ name: 'xp_transactions' })
export class XpTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index(['userId', 'createdAt'])
  @Column({ type: 'text' })
  userId!: string;

  @Column({ type: 'datetime' })
  createdAt!: Date;

  @Column({ type: 'integer' })
  amount!: number;

  @Column({ type: 'text' })
  type!: XpTransactionTypeDb;

  @Column({ type: 'text' })
  actorId!: string;

  @Column({ type: 'text', nullable: true })
  taskId!: string | null;

  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  @Column({ type: 'simple-json', nullable: true })
  meta!: Record<string, unknown> | null;
}
