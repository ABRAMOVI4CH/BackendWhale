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
    if (existing) {
      await this.seedProfileDefaults(userId);
      return;
    }

    const now = Date.now();
    const day = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000);

    const auditId = () => `${randomUUID()}`;

    const tasks = await this.tasksRepo.save([
      this.tasksRepo.create({
        userId,
        title: 'РљСЌС€РёСЂРѕРІР°РЅРёРµ РІ API РєР»РёРµРЅС‚Рµ',
        project: 'CORE-API',
        baseXp: 100,
        dueAt: day(1),
        status: 'in_progress',
        finalXp: null,
        completedAt: null,
        description:
          'РЎРґРµР»Р°С‚СЊ РєСЌС€РёСЂРѕРІР°РЅРёРµ GET-Р·Р°РїСЂРѕСЃРѕРІ РІ API РєР»РёРµРЅС‚Рµ Рё СѓР±РµРґРёС‚СЊСЃСЏ, С‡С‚Рѕ РёРЅРІР°Р»РёРґРёСЂСѓРµС‚СЃСЏ РїРѕ РєР»СЋС‡Сѓ.',
        tags: ['backend', 'performance'],
        review: 'pending',
        xpBreakdown: {
          xpBase: 100,
          kDeadline: null,
          kDeadlineLabel: 'РµС‰С‘ РІ СЂР°Р±РѕС‚Рµ',
          kReview: null,
          kReviewLabel: 'Р¶РґС‘С‚ РѕС†РµРЅРєРё',
          bonusPrIterations: 0,
          bonusReviewer: 0,
          xpFinal: null,
        },
        audit: [
          {
            id: auditId(),
            type: 'created',
            at: day(-3).toISOString(),
            actorName: 'РњРµРЅРµРґР¶РµСЂ',
            title: 'Р—Р°РґР°С‡Р° СЃРѕР·РґР°РЅР°',
            subtitle: 'РќР°Р·РЅР°С‡РµРЅР° С‚РµР±Рµ',
          },
          {
            id: auditId(),
            type: 'deadline_changed',
            at: day(-1).toISOString(),
            actorName: 'РњРµРЅРµРґР¶РµСЂ',
            title: 'РР·РјРµРЅС‘РЅ РґРµРґР»Р°Р№РЅ',
            subtitle: `Р‘С‹Р»Рѕ: ${day(2).toLocaleDateString('ru-RU')} в†’ РЎС‚Р°Р»Рѕ: ${day(1).toLocaleDateString('ru-RU')}`,
          },
        ],
      }),
      this.tasksRepo.create({
        userId,
        title: 'Р”СѓР±Р»Рё РїСЂРё РёРјРїРѕСЂС‚Рµ CSV',
        project: 'IMPORT',
        baseXp: 60,
        dueAt: day(-2),
        status: 'review',
        finalXp: null,
        completedAt: day(-1),
        description:
          'РЈСЃС‚СЂР°РЅРёС‚СЊ РґСѓР±Р»Рё РїСЂРё РёРјРїРѕСЂС‚Рµ CSV, РґРѕР±Р°РІРёС‚СЊ С‚РµСЃС‚ Рё РјРёРіСЂР°С†РёСЋ СѓРЅРёРєР°Р»СЊРЅРѕРіРѕ РёРЅРґРµРєСЃР° РїСЂРё РЅРµРѕР±С…РѕРґРёРјРѕСЃС‚Рё.',
        tags: ['data', 'import'],
        review: 'pending',
        xpBreakdown: {
          xpBase: 60,
          kDeadline: 0.9,
          kDeadlineLabel: 'СЃ РїСЂРѕСЃСЂРѕС‡РєРѕР№',
          kReview: null,
          kReviewLabel: 'Р¶РґС‘С‚ РѕС†РµРЅРєРё',
          bonusPrIterations: 10,
          bonusReviewer: 0,
          xpFinal: null,
        },
        audit: [
          {
            id: auditId(),
            type: 'created',
            at: day(-12).toISOString(),
            actorName: 'РњРµРЅРµРґР¶РµСЂ',
            title: 'Р—Р°РґР°С‡Р° СЃРѕР·РґР°РЅР°',
          },
          {
            id: auditId(),
            type: 'closed',
            at: day(-1).toISOString(),
            actorName: 'РўС‹',
            title: 'Р—Р°РґР°С‡Р° Р·Р°РєСЂС‹С‚Р°',
            subtitle: 'РћР¶РёРґР°РµС‚ РѕС†РµРЅРєРё СЂРµРІСЊСЋ',
          },
          {
            id: auditId(),
            type: 'pr_iterations_set',
            at: day(-1).toISOString(),
            actorName: 'Р РµРІСЊСЋРµСЂ',
            title: 'РС‚РµСЂР°С†РёРё РїСЂР°РІРѕРє',
            subtitle: '1 РїСЂР°РІРєР° (+10 XP)',
          },
        ],
      }),
      this.tasksRepo.create({
        userId,
        title: 'РўРµСЃС‚С‹ РјРѕРґСѓР»СЏ scoring',
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
        title: 'Р РµС„Р°РєС‚РѕСЂРёРЅРі СЂР°СЃС‡С‘С‚Р° РјРЅРѕР¶РёС‚РµР»РµР№ XP',
        project: 'GRADE',
        baseXp: 120,
        dueAt: day(-10),
        status: 'done',
        finalXp: 156,
        completedAt: day(-9),
        description:
          'РџСЂРёРІРµСЃС‚Рё СЂР°СЃС‡С‘С‚ РјРЅРѕР¶РёС‚РµР»РµР№ XP Рє РµРґРёРЅРѕР№ С„РѕСЂРјСѓР»Рµ, РґРѕР±Р°РІРёС‚СЊ РѕС‚РѕР±СЂР°Р¶РµРЅРёРµ breakdown РІ РєР°СЂС‚РѕС‡РєРµ Р·Р°РґР°С‡Рё.',
        tags: ['core', 'grade'],
        review: 'approved',
        xpBreakdown: {
          xpBase: 120,
          kDeadline: 1.0,
          kDeadlineLabel: 'РІРѕРІСЂРµРјСЏ',
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
            actorName: 'РњРµРЅРµРґР¶РµСЂ',
            title: 'Р—Р°РґР°С‡Р° СЃРѕР·РґР°РЅР°',
          },
          {
            id: auditId(),
            type: 'closed',
            at: day(-9).toISOString(),
            actorName: 'РўС‹',
            title: 'Р—Р°РґР°С‡Р° Р·Р°РєСЂС‹С‚Р°',
          },
          {
            id: auditId(),
            type: 'review_assessed',
            at: day(-9).toISOString(),
            actorName: 'Р РµРІСЊСЋРµСЂ',
            title: 'РћС†РµРЅРєР° СЂРµРІСЊСЋ',
            subtitle: 'Approved (Г—1.2)',
          },
          {
            id: auditId(),
            type: 'manual_adjustment',
            at: day(-8).toISOString(),
            actorName: 'РњРµРЅРµРґР¶РµСЂ',
            title: 'Р СѓС‡РЅР°СЏ РєРѕСЂСЂРµРєС‚РёСЂРѕРІРєР°',
            subtitle: '+0 XP В· вЂњР±РµР· РёР·РјРµРЅРµРЅРёР№вЂќ',
          },
        ],
      }),
      this.tasksRepo.create({
        userId,
        title: 'РћР±РЅРѕРІРёС‚СЊ РґРѕРєСѓРјРµРЅС‚Р°С†РёСЋ РїРѕ РѕРЅР±РѕСЂРґРёРЅРіСѓ',
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
        comment: 'Approved Г—1.0',
        meta: { kReview: 1.0 },
      }),
      this.xpRepo.create({
        userId,
        createdAt: new Date(now - 1000 * 60 * 60 * 3),
        amount: -20,
        type: 'manual_adjustment',
        actorId: 'manager:ivan',
        taskId: null,
        comment: 'РљРѕСЂСЂРµРєС‚РёСЂРѕРІРєР° Р·Р° РїРµСЂРµРЅРѕСЃ РґРµРґР»Р°Р№РЅР°',
        meta: null,
      }),
      this.xpRepo.create({
        userId,
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 2),
        amount: 100,
        type: 'task_award',
        actorId: 'system',
        taskId: tasks[0].id,
        comment: 'Approved Г—1.2',
        meta: { kReview: 1.2 },
      }),
      this.xpRepo.create({
        userId,
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 9),
        amount: 0,
        type: 'grade_up',
        actorId: 'system',
        taskId: null,
        comment: 'РџРѕРІС‹С€РµРЅРёРµ РіСЂРµР№РґР°: Junior в†’ Middle',
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
      await this.usersRepo.update({ id: userId }, { fullName: 'РРІР°РЅ РџРµС‚СЂРѕРІ' });
    }
  }
}

