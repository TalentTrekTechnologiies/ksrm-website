import {
  ArrayMinSize,
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

export const ADMISSION_PROGRAM_SECTIONS = ['homepage_admission_programs'] as const;
export type AdmissionProgramSection = (typeof ADMISSION_PROGRAM_SECTIONS)[number];

export class CreateAdmissionProgramDto {
  @IsIn(ADMISSION_PROGRAM_SECTIONS)
  section: AdmissionProgramSection;

  // Reused as the small label above the title (e.g. "B.Tech Programmes")
  // rather than a literal icon name - same ContentCard.icon column Quick
  // Links leaves empty, repurposed here instead of a schema change.
  @IsOptional()
  @IsString()
  @MaxLength(60)
  icon?: string;

  @IsPathOrUrl()
  imageUrl: string;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsString()
  @MaxLength(100)
  title: string;

  // The "750+ Seats | 8 Branches | 4 Years" info line.
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  // Branches as a real structured list (chip add/remove in the editor UI),
  // not a comma-separated string - so adding a branch like "AI & DS" is a
  // content edit, not a developer change. Required + non-empty: a program
  // card with zero branches is a broken-looking card, not a valid partial
  // state.
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tags: string[];

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
