import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProgrammeLevel } from '@prisma/client';

export class CreateSyllabusProgrammeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name: string;

  /**
   * Which branches are listed under the heading. Omit for a course with no
   * specialisations - its regulations then carry the documents directly.
   */
  @IsOptional()
  @IsEnum(ProgrammeLevel)
  level?: ProgrammeLevel;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  nameContains?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSyllabusProgrammeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name?: string;

  // Nullable on purpose: clearing the level is how an admin says "this course
  // has no branches", which is different from "leave the level alone".
  @IsOptional()
  @IsEnum(ProgrammeLevel)
  level?: ProgrammeLevel | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  nameContains?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsInt()
  @Min(1)
  version: number;
}

export class CreateSyllabusRegulationDto {
  /**
   * Exactly the text that appears in the uploaded filenames - a document is
   * matched on it, so "R23" and "R 23" are not the same thing.
   */
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  label?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateSyllabusRegulationDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  label?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsInt()
  @Min(1)
  version: number;
}

class ReorderItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderSyllabusDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
