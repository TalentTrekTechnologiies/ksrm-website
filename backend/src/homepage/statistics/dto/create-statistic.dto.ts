import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

// The statistic groupings this codebase queries by. Restricted to a closed
// set (not a free string) so a typo in `scope` can't silently create an
// orphaned group the public site never queries. 'department' rows are
// further disambiguated by departmentId below.
export const STATISTIC_GROUPS = ['homepage', 'homepage_placements', 'department'] as const;
export type StatisticGroup = (typeof STATISTIC_GROUPS)[number];

export class CreateStatisticDto {
  @IsIn(STATISTIC_GROUPS)
  scope: StatisticGroup;

  // Required when scope === 'department'; ignored otherwise.
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsString()
  @MaxLength(80)
  label: string;

  @IsInt()
  value: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  suffix?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
