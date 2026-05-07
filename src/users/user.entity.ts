import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type UserRole = 'employee' | 'manager' | 'reviewer';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  login!: string;

  @Column({ type: 'text' })
  passwordHash!: string;

  @Column({ type: 'text', default: 'employee' })
  role!: UserRole;

  /** Server-side XP ledger balance (MVP single source of truth). */
  @Column({ type: 'integer', default: 0 })
  totalXp!: number;

  @Column({ type: 'text', default: '' })
  fullName!: string;

  @Column({ type: 'text', default: '' })
  team!: string;

  @CreateDateColumn()
  createdAt!: Date;
}

