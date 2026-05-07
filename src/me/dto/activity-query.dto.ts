import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Max } from 'class-validator';

export class ActivityQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(200)
  limit?: number;
}
