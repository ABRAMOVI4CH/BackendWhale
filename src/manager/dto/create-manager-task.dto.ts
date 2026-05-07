import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import type {
  ManagerDifficultyTag,
  ManagerLevelTag,
  ManagerPriorityTag,
  ManagerTimeTag,
} from '../manager-task.entity';

export class CreateManagerTaskDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsIn(['easy', 'medium', 'hard'])
  difficulty!: ManagerDifficultyTag;

  @IsIn(['XS', 'S', 'M', 'L'])
  time!: ManagerTimeTag;

  @IsIn(['low', 'normal', 'high'])
  priority!: ManagerPriorityTag;

  @IsIn(['junior', 'middle', 'senior'])
  level!: ManagerLevelTag;

  @IsOptional()
  @IsString()
  assigneeId?: string;
}
