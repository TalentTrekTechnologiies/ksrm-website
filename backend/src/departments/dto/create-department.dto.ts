import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

// Real Department profile entity (bio/vision/mission/hero image) behind the
// full department detail pages - not to be confused with the homepage
// teaser cards in ../homepage/departments (ContentCard, section
// 'homepage_departments'). Parent-table CRUD only tonight; child tables
// (DepartmentProgramme, DepartmentHighlight, LearningOutcome, Lab) are out
// of scope for this DTO.
export class CreateDepartmentDto {
  @IsString()
  @MaxLength(160)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug must be lowercase alphanumeric with hyphens only',
  })
  slug: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  shortName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  tagline?: string;

  @IsOptional()
  @IsString()
  intro?: string;

  @IsString()
  about: string;

  @IsOptional()
  @IsString()
  aboutVideoUrl?: string;

  @IsOptional()
  @IsString()
  heroImageUrl?: string;

  @IsOptional()
  @IsInt()
  heroMediaId?: number;

  @IsOptional()
  @IsString()
  vision?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mission?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  establishedYear?: number;

  @IsOptional()
  @IsInt()
  hodId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  metaDescription?: string;

  @IsOptional()
  @IsString()
  ogImageUrl?: string;
}
