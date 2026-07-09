import { ArrayMinSize, IsArray, IsIn, IsInt, Min, ValidateNested } from 'class-validator';
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

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderStatisticItemDto)
  items: ReorderStatisticItemDto[];
}
