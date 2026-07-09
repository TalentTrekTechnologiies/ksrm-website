import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsPathOrUrl } from '../../dto/is-path-or-url.validator';

export const DEPARTMENT_CARD_SECTIONS = ['homepage_departments'] as const;
export type DepartmentCardSection = (typeof DEPARTMENT_CARD_SECTIONS)[number];

// Homepage teaser cards only - deliberately decoupled from the real
// `Department` entity (bio/faculty/labs/programmes), which is only 1/7
// populated. See Sprint 1C plan's "Key decisions" #1. `tags` holds the
// optional "Programs" pill list an editor can fill in by hand - it is not
// derived from the real Department/DepartmentProgramme tables.
export class CreateDepartmentCardDto {
  @IsIn(DEPARTMENT_CARD_SECTIONS)
  section: DepartmentCardSection;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  icon?: string;

  @IsPathOrUrl()
  imageUrl: string;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  // Programs pill list - optional and may be empty, unlike Admission
  // Programs' required non-empty branch list, since no real per-department
  // programme data has been confirmed for 6 of the 7 departments yet.
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsPathOrUrl()
  linkUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  linkText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
