import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtPayload } from '../auth/jwt.types';
import { CreateManagerTaskDto } from './dto/create-manager-task.dto';
import { ManagerService } from './manager.service';

@ApiTags('manager')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('manager')
export class ManagerController {
  constructor(private readonly manager: ManagerService) {}

  @Get('tasks')
  listTasks(@CurrentUser() user: JwtPayload) {
    return this.manager.listTasks(user);
  }

  @Post('tasks')
  createTask(@CurrentUser() user: JwtPayload, @Body() dto: CreateManagerTaskDto) {
    return this.manager.createTask(user, dto);
  }
}
