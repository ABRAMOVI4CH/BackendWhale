import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { GRADES, gradeForTotalXp, progressWithinGrade, type GradeKey } from '../common/grades';
import { UserEntity } from '../users/user.entity';
import { EmployeeTaskEntity } from './employee-task.entity';
import type { ActivityQueryDto } from './dto/activity-query.dto';
import type { WeeklyStatsQueryDto } from './dto/weekly-stats-query.dto';
import type { XpTransactionsQueryDto } from './dto/xp-transactions-query.dto';
import { XpTransactionEntity } from './xp-transaction.entity';

function toIso(date: Date | null | undefined): string | null {
  if (!date) return null;
  return date.toISOString();
}

function startOfDayUtc(d: Date): Date {
  const x = new Date(d.getTime());
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

/** RU-relative label similar to mocked client timeline (UTC midnight buckets). */
function ruRelativeDaysLabel(now: Date, ts: Date): string {
  const dayMs = 24 * 60 * 60 * 1000;
  const dn = Math.floor(
    (startOfDayUtc(now).getTime() - startOfDayUtc(ts).getTime()) / dayMs,
  );
  if (dn === 0) return 'сегодня';
  if (dn === 1) return 'вчера';
  return `${dn} дн. назад`;
}

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(EmployeeTaskEntity)
    private readonly tasksRepo: Repository<EmployeeTaskEntity>,
    @InjectRepository(XpTransactionEntity)
    private readonly xpRepo: Repository<XpTransactionEntity>,
  ) {}

  private async getUserOrThrow(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('user_not_found');
    return user;
  }

  private buildGradeSummary(totalXp: number) {
    const gradeInfo = gradeForTotalXp(totalXp);
    const progressInGradePercent = progressWithinGrade(totalXp);
    return {
      grade: gradeInfo.label as GradeKey,
      totalXp,
      progressInGradePercent,
      gradeBounds: gradeInfo,
      nextGrade: gradeInfo.next,
    };
  }

  async getFullMe(userId: string) {
    const user = await this.getUserOrThrow(userId);
    const gs = this.buildGradeSummary(user.totalXp);

    return {
      grades: GRADES,
      profile: {
        fullName: user.fullName ?? '',
        team: user.team ?? '',
        login: user.login,
        accountRole: user.role,
      },
      summary: {
        totalXp: gs.totalXp,
        grade: gs.grade,
        progressInGradePercent: gs.progressInGradePercent,
        nextGrade: gs.nextGrade,
      },
      createdAt: user.createdAt.toISOString(),
    };
  }

  async getSummary(userId: string) {
    const user = await this.getUserOrThrow(userId);
    const gs = this.buildGradeSummary(user.totalXp);

    return {
      grades: GRADES,
      profile: {
        fullName: user.fullName ?? '',
        team: user.team ?? '',
        login: user.login,
        accountRole: user.role,
      },
      totalXp: gs.totalXp,
      grade: gs.grade,
      progressInGradePercent: gs.progressInGradePercent,
      nextGrade: gs.nextGrade,
    };
  }

  async listTasks(userId: string) {
    const rows = await this.tasksRepo.find({
      where: { userId },
      order: { dueAt: 'ASC' },
    });

    return rows.map((t) => ({
      id: t.id,
      title: t.title,
      project: t.project,
      baseXp: t.baseXp,
      dueAt: toIso(t.dueAt),
      status: t.status,
      finalXp: t.finalXp,
      completedAt: toIso(t.completedAt),
    }));
  }

  async getTaskDetails(userId: string, taskId: string) {
    const t = await this.tasksRepo.findOne({ where: { id: taskId } });
    if (!t || t.userId !== userId) throw new NotFoundException('task_not_found');

    const xp =
      (t.xpBreakdown as Record<string, unknown> | null | undefined) ?? {
        xpBase: t.baseXp,
        kDeadline: null,
        kDeadlineLabel: null,
        kReview: null,
        kReviewLabel: null,
        bonusPrIterations: 0,
        bonusReviewer: 0,
        xpFinal: t.finalXp,
      };

    return {
      id: t.id,
      title: t.title,
      project: t.project,
      baseXp: t.baseXp,
      dueAt: toIso(t.dueAt),
      status: t.status,
      finalXp: t.finalXp,
      completedAt: toIso(t.completedAt),
      description: t.description,
      tags: t.tags ?? null,
      review: t.review ?? null,
      xp,
      audit: (t.audit ?? []) as Array<Record<string, unknown>>,
    };
  }

  async listXpTransactions(userId: string, query: XpTransactionsQueryDto) {
    let qb = this.xpRepo
      .createQueryBuilder('x')
      .where('x.userId = :uid', { uid: userId })
      .orderBy('x.createdAt', 'DESC');

    const fromMs = query.from ? Date.parse(query.from) : NaN;
    const toMs = query.to ? Date.parse(query.to) : NaN;

    const fromOk = Number.isFinite(fromMs);
    const toOk = Number.isFinite(toMs);

    if (fromOk) qb = qb.andWhere('x.createdAt >= :from', { from: new Date(fromMs) });
    if (toOk) qb = qb.andWhere('x.createdAt <= :to', { to: new Date(toMs) });

    const limit = query.limit ?? 500;
    qb = qb.take(limit);

    const rows = await qb.getMany();

    return rows.map((tx) => ({
      id: tx.id,
      createdAt: tx.createdAt.toISOString(),
      amount: tx.amount,
      type: tx.type,
      actorId: tx.actorId,
      taskId: tx.taskId ?? undefined,
      comment: tx.comment ?? undefined,
      meta: tx.meta ?? undefined,
    }));
  }

  private async taskTitlesById(userId: string) {
    const tasks = await this.tasksRepo.find({ where: { userId }, select: ['id', 'title'] });
    const m = new Map<string, string>();
    for (const t of tasks) m.set(t.id, t.title);
    return m;
  }

  private mapTxToActivityEvent(tx: XpTransactionEntity, titlesById: Map<string, string>, now: Date) {
    const taskTitle = tx.taskId ? titlesById.get(tx.taskId) : undefined;

    if (tx.type === 'task_award') {
      return {
        id: tx.id,
        type: 'task_award' as const,
        title:
          taskTitle != null ? `Задача закрыта: «${taskTitle}»` : 'Задача: начисление XP',
        subtitle: tx.comment ?? '—',
        createdAtLabel: ruRelativeDaysLabel(now, tx.createdAt),
        xpDelta: tx.amount !== 0 ? tx.amount : undefined,
        tone: (tx.amount >= 0 ? 'positive' : 'neutral') as 'positive' | 'neutral',
      };
    }

    if (tx.type === 'manual_adjustment') {
      return {
        id: tx.id,
        type: 'manual_adjustment' as const,
        title: 'Корректировка XP менеджером',
        subtitle: tx.comment ?? '—',
        createdAtLabel: ruRelativeDaysLabel(now, tx.createdAt),
        xpDelta: tx.amount !== 0 ? tx.amount : undefined,
        tone: 'neutral' as const,
      };
    }

    return {
      id: tx.id,
      type: 'grade_up' as const,
      title: 'Повышение грейда',
      subtitle: tx.comment ?? '—',
      createdAtLabel: ruRelativeDaysLabel(now, tx.createdAt),
      xpDelta: tx.amount !== 0 ? tx.amount : undefined,
      tone: 'positive' as const,
    };
  }

  async getActivityFeed(userId: string, query: ActivityQueryDto) {
    const now = new Date();
    const rows = await this.xpRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: Math.min(Math.max(query.limit ?? 50, 1), 200),
    });
    const titles = await this.taskTitlesById(userId);
    return rows.map((tx) => this.mapTxToActivityEvent(tx, titles, now));
  }

  async getWeeklySummary(userId: string, query: WeeklyStatsQueryDto) {
    const days = query.days ?? 7;
    const now = new Date();
    const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const txs = await this.xpRepo.find({
      where: {
        userId,
        createdAt: Between(from, now),
      },
    });

    const xp7d = txs.reduce((s, tx) => s + tx.amount, 0);

    const tasksDoneRows = await this.tasksRepo.find({
      where: { userId, status: 'done' },
    });

    let tasksDone7d = 0;

    const kReviews: number[] = [];
    for (const tx of txs) {
      if (tx.type !== 'task_award') continue;
      const mr = tx.meta?.kReview;
      if (typeof mr === 'number' && Number.isFinite(mr)) kReviews.push(mr);
    }

    for (const t of tasksDoneRows) {
      if (!t.completedAt) continue;
      if (t.completedAt >= from && t.completedAt <= now) tasksDone7d += 1;
    }

    const reviewMultiplierAvg =
      kReviews.length > 0
        ? Math.round((kReviews.reduce((a, b) => a + b, 0) / kReviews.length) * 100) /
          100
        : 0;

    return { xp7d, tasksDone7d, reviewMultiplierAvg };
  }
}