import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import type { UserRole } from '../../users/user.entity';

export class RegisterDto {
  @IsString()
  login!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsIn(['employee', 'manager', 'reviewer'])
  role?: UserRole;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  team?: string;
}

