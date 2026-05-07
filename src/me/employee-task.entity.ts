import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type EmployeeTaskStatusDb =
  | 'in_progress'
  | 'review'
  | 'done'
  | 'cancelled';

export type EmployeeReviewGradeDb =
  | 'approved'
  | 'needs_work'
  | 'rejected'
  | 'pending';

@Entity({ name: 'employee_tasks' })
export class EmployeeTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index(['userId'])
  @Column({ type: 'text' })
  userId!: string;

  @Index(['managerTaskId'])
  @Column({ type: 'text', nullable: true })
  managerTaskId!: string | null;

  @Column({ type: 'text', nullable: true })
  managerId!: string | null;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  project!: string;

  @Column({ type: 'integer' })
  baseXp!: number;

  @Column({ type: 'datetime', nullable: true })
  dueAt!: Date | null;

  @Column({ type: 'text' })
  status!: EmployeeTaskStatusDb;

  @Column({ type: 'integer', nullable: true })
  finalXp!: number | null;

  @Column({ type: 'datetime', nullable: true })
  completedAt!: Date | null;

  /** Extended fields for task details endpoint */
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'simple-json', nullable: true })
  tags!: string[] | null;

  @Column({ type: 'text', nullable: true })
  review!: EmployeeReviewGradeDb | null;

  @Column({ type: 'simple-json', nullable: true })
  xpBreakdown!: Record<string, unknown> | null;

  /** EmployeeTaskAuditEvent[] */
  @Column({ type: 'simple-json', nullable: true })
  audit!: Array<Record<string, unknown>> | null;
}
