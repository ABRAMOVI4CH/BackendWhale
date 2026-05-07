import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from '../users/user.entity';
import { MeModule } from '../me/me.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    MeModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

