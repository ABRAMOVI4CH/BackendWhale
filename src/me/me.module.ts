import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/user.entity';
import { EmployeeTaskEntity } from './employee-task.entity';
import { XpTransactionEntity } from './xp-transaction.entity';
import { MeController } from './me.controller';
import { MeService } from './me.service';
import { UserSeedService } from './user-seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      EmployeeTaskEntity,
      XpTransactionEntity,
    ]),
  ],
  controllers: [MeController],
  providers: [MeService, UserSeedService],
  exports: [UserSeedService],
})
export class MeModule {}
