import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

// The two statistic groupings Sprint 1A wires up - CampusStats' 8-card grid
// and Placements' 4-card grid. Restricted to exactly these two (not a free
// string) so a typo in `scope` can't silently create an orphaned group the
// public site never queries.
export const STATISTIC_GROUPS = ['homepage', 'homepage_placements'] as const;
export type StatisticGroup = (typeof STATISTIC_GROUPS)[number];

export class CreateStatisticDto {
  @IsIn(STATISTIC_GROUPS)
  scope: StatisticGroup;

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
