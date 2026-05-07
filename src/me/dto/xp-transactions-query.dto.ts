import { IsDateString, IsOptional, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class XpTransactionsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  /** Max records to return (default 500). */
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  @Max(2000)
  limit?: number;
}
