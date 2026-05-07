import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.types';
import { ActivityQueryDto } from './dto/activity-query.dto';
import { WeeklyStatsQueryDto } from './dto/weekly-stats-query.dto';
import { XpTransactionsQueryDto } from './dto/xp-transactions-query.dto';
import { MeService } from './me.service';

@ApiTags('me')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('me')
export class MeController {
  constructor(private readonly me: MeService) {}

  @Get()
  getMe(@CurrentUser() user: JwtPayload) {
    return this.me.getFullMe(user.sub);
  }

  /** Compact summary (same shapes as `GET /me`, but without extra nesting). */
  @Get('summary')
  getSummary(@CurrentUser() user: JwtPayload) {
    return this.me.getSummary(user.sub);
  }

  @Get('tasks')
  listTasks(@CurrentUser() user: JwtPayload) {
    return this.me.listTasks(user.sub);
  }

  @Get('tasks/:id')
  taskDetails(@CurrentUser() user: JwtPayload, @Param('id') taskId: string) {
    return this.me.getTaskDetails(user.sub, taskId);
  }

  @Get('xp/transactions')
  listXp(@CurrentUser() user: JwtPayload, @Query() query: XpTransactionsQueryDto) {
    return this.me.listXpTransactions(user.sub, query);
  }

  @Get('activity')
  activity(@CurrentUser() user: JwtPayload, @Query() query: ActivityQueryDto) {
    return this.me.getActivityFeed(user.sub, query);
  }

  @Get('stats/weekly')
  weekly(@CurrentUser() user: JwtPayload, @Query() query: WeeklyStatsQueryDto) {
    return this.me.getWeeklySummary(user.sub, query);
  }
}
