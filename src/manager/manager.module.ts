import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeTaskEntity } from '../me/employee-task.entity';
import { UserEntity } from '../users/user.entity';
import { TasksGateway } from '../tasks/tasks.gateway';
import { ManagerController } from './manager.controller';
import { ManagerTaskEntity } from './manager-task.entity';
import { ManagerService } from './manager.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, EmployeeTaskEntity, ManagerTaskEntity])],
  controllers: [ManagerController],
  providers: [ManagerService, TasksGateway],
})
export class ManagerModule {}
