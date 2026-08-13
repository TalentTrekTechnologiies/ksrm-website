import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { STATISTIC_GROUPS } from './create-statistic.dto';
import type { StatisticGroup } from './create-statistic.dto';

class ReorderStatisticItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderStatisticsDto {
  @IsIn(STATISTIC_GROUPS)
  scope: StatisticGroup;

  // Required when scope === 'department', to stop items from two different
  // departments' stat blocks being reordered against each other by mistake.
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderStatisticItemDto)
  items: ReorderStatisticItemDto[];
}
