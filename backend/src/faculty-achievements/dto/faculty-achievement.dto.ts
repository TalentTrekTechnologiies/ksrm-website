import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { FacultyAchievementType } from '@prisma/client';

export class CreateFacultyAchievementDto {
  @IsInt()
  facultyId: number;

  @IsEnum(FacultyAchievementType)
  type: FacultyAchievementType;

  @IsString()
  @MaxLength(500)
  title: string;

  /** Journal, conference, publisher, or granting authority. */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  detail?: string;

  /** DOI, ISSN/ISBN, patent or application number. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  referenceNo?: string;

  /**
   * Publication date, or a patent's date of issue. Optional on purpose: older
   * records are often remembered only by year, and a filed patent has no issue
   * date yet.
   */
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFacultyAchievementDto {
  @IsOptional()
  @IsEnum(FacultyAchievementType)
  type?: FacultyAchievementType;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  detail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  referenceNo?: string;

  // Explicitly nullable so an issue date can be cleared when a granted patent
  // turns out to still be pending.
  @IsOptional()
  @IsDateString()
  date?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  url?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsInt()
  version: number;
}

class ReorderItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderFacultyAchievementsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
