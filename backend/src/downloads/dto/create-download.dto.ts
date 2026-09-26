import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { DownloadCategory } from '@prisma/client';

export class CreateDownloadDto {
  @IsString()
  @MaxLength(300)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DownloadCategory)
  category: DownloadCategory;

  // Optional page/section slug (edc, iic, iqac, alumni, academics, ...) that
  // surfaces this document on that page's "Downloads & Resources" block.
  @IsOptional()
  @IsString()
  @MaxLength(60)
  pageSection?: string;

  // Optional grouping heading the page renders this document under
  // (e.g. "AY 2025-26", "B.Tech").
  @IsOptional()
  @IsString()
  @MaxLength(80)
  groupLabel?: string;
  // Academic year this document belongs to, as "AY 2026-27". Previous years
  // fold away on the public pages; null means "not year-specific" and always
  // shows.
  @IsOptional()
  @IsString()
  @MaxLength(20)
  academicYear?: string;

  // Which regulation on Academics -> Syllabus this belongs to, and the branch
  // it is for. Set by the Syllabus screen, which asks for both; left unset by
  // the general Downloads form, where the title matching still applies.
  @IsOptional()
  @IsInt()
  syllabusRegulationId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  syllabusBranch?: string | null;


  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
