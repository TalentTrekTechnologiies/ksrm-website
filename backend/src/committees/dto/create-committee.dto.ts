import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
