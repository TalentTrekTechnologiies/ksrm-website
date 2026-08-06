import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { CommitteeType, CommitteePlacement } from '@prisma/client';

export class CreateCommitteeDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsEnum(CommitteeType)
  type: CommitteeType;

  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Which public page lists this committee. Nullable on purpose - clearing it
   * takes the committee off the page without deleting it or its roster.
   */
  @IsOptional()
  @IsEnum(CommitteePlacement)
  placement?: CommitteePlacement | null;

  /**
   * The department this committee belongs to - a Board of Studies is one per
   * department. Nullable for the same reason as `placement`: clearing it makes
   * the committee institution-wide again without deleting its roster.
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  departmentId?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
