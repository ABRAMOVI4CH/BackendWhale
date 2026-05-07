import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import type { JwtPayload } from '../auth/jwt.types';
import { EmployeeTaskEntity } from '../me/employee-task.entity';
import { UserEntity } from '../users/user.entity';
import { TasksGateway } from '../tasks/tasks.gateway';
import { CreateManagerTaskDto } from './dto/create-manager-task.dto';
import { ManagerTaskEntity } from './manager-task.entity';

function toIso(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null;
}

function tagsFromDto(dto: CreateManagerTaskDto) {
  return [
    `difficulty:${dto.difficulty}`,
    `time:${dto.time}`,
    `priority:${dto.priority}`,
    `level:${dto.level}`,
  ];
}

function xpByTags(dto: CreateManagerTaskDto) {
  const difficulty = { easy: 40, medium: 80, hard: 130 }[dto.difficulty];
  const time = { XS: 0, S: 15, M: 35, L: 60 }[dto.time];
  const priority = { low: 0, normal: 10, high: 25 }[dto.priority];
  return difficulty + time + priority;
}

@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    @InjectRepository(EmployeeTaskEntity)
    private readonly employeeTasksRepo: Repository<EmployeeTaskEntity>,
    @InjectRepository(ManagerTaskEntity)
    private readonly managerTasksRepo: Repository<ManagerTaskEntity>,
    private readonly tasksGateway: TasksGateway,
  ) {}

  async listTasks(user: JwtPayload) {
    this.assertManager(user);
    const rows = await this.managerTasksRepo.find({
      where: { managerId: user.sub },
      order: { createdAt: 'DESC' },
    });
    return rows.map((task) => this.mapManagerTask(task));
  }

  async createTask(user: JwtPayload, dto: CreateManagerTaskDto) {
    this.assertManager(user);
    const manager = await this.usersRepo.findOne({ where: { id: user.sub } });
    if (!manager) throw new NotFoundException('manager_not_found');

    const baseXp = xpByTags(dto);
    const task = await this.managerTasksRepo.save(
      this.managerTasksRepo.create({
        managerId: user.sub,
        team: manager.team ?? '',
        title: dto.title.trim(),
        description: dto.description.trim(),
        difficulty: dto.difficulty,
        time: dto.time,
        priority: dto.priority,
        level: dto.level,
        baseXp,
        status: 'published',
      }),
    );

    const assignees = await this.resolveAssignees(manager, dto.assigneeId);
    const createdEmployeeTasks = await this.employeeTasksRepo.save(
      assignees.map((assignee) =>
        this.employeeTasksRepo.create({
          userId: assignee.id,
          managerId: user.sub,
          managerTaskId: task.id,
          title: task.title,
          project: 'MANAGER',
          baseXp,
          dueAt: null,
          status: 'in_progress',
          finalXp: null,
          completedAt: null,
          description: task.description,
          tags: tagsFromDto(dto),
          review: 'pending',
          xpBreakdown: {
            xpBase: baseXp,
            kDeadline: null,
            kDeadlineLabel: 'без дедлайна',
            kReview: null,
            kReviewLabel: 'ждет оценки',
            bonusPrIterations: 0,
            bonusReviewer: 0,
            xpFinal: null,
          },
          audit: [
            {
              id: randomUUID(),
              type: 'created',
              at: new Date().toISOString(),
              actorName: manager.fullName || manager.login,
              title: 'Задача создана',
              subtitle: 'Опубликована менеджером',
            },
          ],
        }),
      ),
    );

    for (const employeeTask of createdEmployeeTasks) {
      this.tasksGateway.emitTaskCreated(employeeTask.userId, this.mapEmployeeTask(employeeTask));
    }

    return {
      ...this.mapManagerTask(task),
      assignedUserIds: createdEmployeeTasks.map((row) => row.userId),
    };
  }

  private async resolveAssignees(manager: UserEntity, assigneeId?: string) {
    if (assigneeId) {
      const user = await this.usersRepo.findOne({ where: { id: assigneeId, role: 'employee' } });
      if (!user) throw new NotFoundException('assignee_not_found');
      return [user];
    }

    const team = manager.team?.trim();
    const teamUsers = team
      ? await this.usersRepo.find({ where: { role: 'employee', team } })
      : [];
    if (teamUsers.length) return teamUsers;

    return this.usersRepo.find({ where: { role: 'employee' } });
  }

  private mapManagerTask(task: ManagerTaskEntity) {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      tags: {
        difficulty: task.difficulty,
        time: task.time,
        priority: task.priority,
        level: task.level,
      },
      createdAt: task.createdAt.toISOString(),
      status: task.status,
      baseXp: task.baseXp,
      team: task.team,
    };
  }

  private mapEmployeeTask(task: EmployeeTaskEntity) {
    return {
      id: task.id,
      title: task.title,
      project: task.project,
      baseXp: task.baseXp,
      dueAt: toIso(task.dueAt),
      status: task.status,
      finalXp: task.finalXp,
      completedAt: toIso(task.completedAt),
    };
  }

  private assertManager(user: JwtPayload) {
    if (user.role !== 'manager') throw new ForbiddenException('manager_role_required');
  }
}
