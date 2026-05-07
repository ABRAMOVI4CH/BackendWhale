import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { EmployeeTaskEntity } from './employee-task.entity';
import { XpTransactionEntity } from './xp-transaction.entity';
import { UserEntity } from '../users/user.entity';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(EmployeeTaskEntity)
    private readonly tasksRepo: Repository<EmployeeTaskEntity>,
    @InjectRepository(XpTransactionEntity)
    private readonly xpRepo: Repository<XpTransactionEntity>,
    @InjectRepository(UserEntity) private readonly usersRepo: Repository<UserEntity>,
  ) {}

  /** Inserts starter tasks + ledger rows for UX parity with the mocked client demo. */
  async seedDemoIfNeeded(userId: string) {
    const existing = await this.tasksRepo.exist({ where: { userId } });
    if (existing) return;

    const now = Date.now();
    const day = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000);

    const auditId = () => `${randomUUID()}`;

    const tasks = await this.tasksRepo.save([
      this.tasksRepo.create({
        userId,
        title: 'Кэширование в API клиенте',
        project: 'CORE-API',
        baseXp: 100,
        dueAt: day(1),
        status: 'in_progress',
        finalXp: null,
        completedAt: null,
        description:
          'Сделать кэширование GET-запросов в API клиенте и убедиться, что инвалидируется по ключу.',
        tags: ['backend', 'performance'],
        review: 'pending',
        xpBreakdown: {
          xpBase: 100,
          kDeadline: null,
          kDeadlineLabel: 'ещё в работе',
          kReview: null,
          kReviewLabel: 'ждёт оценки',
          bonusPrIterations: 0,
          bonusReviewer: 0,
          xpFinal: null,
        },
        audit: [
          {
            id: auditId(),
            type: 'created',
            at: day(-3).toISOString(),
            actorName: 'Менеджер',
            title: 'Задача создана',
            subtitle: 'Назначена тебе',
          },
          {
            id: auditId(),
            type: 'deadline_changed',
            at: day(-1).toISOString(),
            actorName: 'Менеджер',
            title: 'Изменён дедлайн',
            subtitle: `Было: ${day(2).toLocaleDateString('ru-RU')} → Стало: ${day(1).toLocaleDateString('ru-RU')}`,
          },
        ],
      }),
      this.tasksRepo.create({
        userId,
        title: 'Дубли при импорте CSV',
        project: 'IMPORT',
        baseXp: 60,
        dueAt: day(-2),
        status: 'review',
        finalXp: null,
        completedAt: day(-1),
        description:
          'Устранить дубли при импорте CSV, добавить тест и миграцию уникального индекса при необходимости.',
        tags: ['data', 'import'],
        review: 'pending',
        xpBreakdown: {
          xpBase: 60,
          kDeadline: 0.9,
          kDeadlineLabel: 'с просрочкой',
          kReview: null,
          kReviewLabel: 'ждёт оценки',
          bonusPrIterations: 10,
          bonusReviewer: 0,
          xpFinal: null,
        },
        audit: [
          {
            id: auditId(),
            type: 'created',
            at: day(-12).toISOString(),
            actorName: 'Менеджер',
            title: 'Задача создана',
          },
          {
            id: auditId(),
            type: 'closed',
            at: day(-1).toISOString(),
            actorName: 'Ты',
            title: 'Задача закрыта',
            subtitle: 'Ожидает оценки ревью',
          },
          {
            id: auditId(),
            type: 'pr_iterations_set',
            at: day(-1).toISOString(),
            actorName: 'Ревьюер',
            title: 'Итерации правок',
            subtitle: '1 правка (+10 XP)',
          },
        ],
      }),
      this.tasksRepo.create({
        userId,
        title: 'Тесты модуля scoring',
        project: 'SCORING',
        baseXp: 80,
        dueAt: day(5),
        status: 'in_progress',
        finalXp: null,
        completedAt: null,
        description: null,
        tags: null,
        review: null,
        xpBreakdown: null,
        audit: null,
      }),
      this.tasksRepo.create({
        userId,
        title: 'Рефакторинг расчёта множителей XP',
        project: 'GRADE',
        baseXp: 120,
        dueAt: day(-10),
        status: 'done',
        finalXp: 156,
        completedAt: day(-9),
        description:
          'Привести расчёт множителей XP к единой формуле, добавить отображение breakdown в карточке задачи.',
        tags: ['core', 'grade'],
        review: 'approved',
        xpBreakdown: {
          xpBase: 120,
          kDeadline: 1.0,
          kDeadlineLabel: 'вовремя',
          kReview: 1.2,
          kReviewLabel: 'Approved',
          bonusPrIterations: 0,
          bonusReviewer: 0,
          xpFinal: 156,
        },
        audit: [
          {
            id: auditId(),
            type: 'created',
            at: day(-20).toISOString(),
            actorName: 'Менеджер',
            title: 'Задача создана',
          },
          {
            id: auditId(),
            type: 'closed',
            at: day(-9).toISOString(),
            actorName: 'Ты',
            title: 'Задача закрыта',
          },
          {
            id: auditId(),
            type: 'review_assessed',
            at: day(-9).toISOString(),
            actorName: 'Ревьюер',
            title: 'Оценка ревью',
            subtitle: 'Approved (×1.2)',
          },
          {
            id: auditId(),
            type: 'manual_adjustment',
            at: day(-8).toISOString(),
            actorName: 'Менеджер',
            title: 'Ручная корректировка',
            subtitle: '+0 XP · “без изменений”',
          },
        ],
      }),
      this.tasksRepo.create({
        userId,
        title: 'Обновить документацию по онбордингу',
        project: 'DOCS',
        baseXp: 40,
        dueAt: null,
        status: 'cancelled',
        finalXp: 0,
        completedAt: day(-30),
        description: null,
        tags: null,
        review: null,
        xpBreakdown: null,
        audit: null,
      }),
    ]);

    const tImport = tasks[1];

    await this.xpRepo.save([
      this.xpRepo.create({
        userId,
        createdAt: new Date(now - 1000 * 60 * 45),
        amount: 60,
        type: 'task_award',
        actorId: 'system',
        taskId: tImport.id,
        comment: 'Approved ×1.0',
        meta: { kReview: 1.0 },
      }),
      this.xpRepo.create({
        userId,
        createdAt: new Date(now - 1000 * 60 * 60 * 3),
        amount: -20,
        type: 'manual_adjustment',
        actorId: 'manager:ivan',
        taskId: null,
        comment: 'Корректировка за перенос дедлайна',
        meta: null,
      }),
      this.xpRepo.create({
        userId,
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2),
        amount: 100,
        type: 'task_award',
        actorId: 'system',
        taskId: tasks[0].id,
        comment: 'Approved ×1.2',
        meta: { kReview: 1.2 },
      }),
      this.xpRepo.create({
        userId,
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 9),
        amount: 0,
        type: 'grade_up',
        actorId: 'system',
        taskId: null,
        comment: 'Повышение грейда: Junior → Middle',
        meta: null,
      }),
    ]);

    await this.reconcileUserXpFromLedger(userId);
  }

  private async reconcileUserXpFromLedger(userId: string) {
    const row = await this.xpRepo
      .createQueryBuilder('x')
      .select('SUM(x.amount)', 'sum')
      .where('x.userId = :uid', { uid: userId })
      .getRawOne<{ sum: string | null }>();

    const total = Number(row?.sum ?? 0);

    await this.usersRepo.update({ id: userId }, { totalXp: Number.isFinite(total) ? total : 0 });

    await this.seedProfileDefaults(userId);
  }

  private async seedProfileDefaults(userId: string) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) return;
    if (!user.fullName?.trim()) {
      await this.usersRepo.update({ id: userId }, { fullName: 'Иван Петров' });
    }
  }
}
