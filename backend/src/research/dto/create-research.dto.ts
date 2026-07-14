import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

// Deliberately simple, matching the existing Research table (schema.prisma):
// no soft-delete columns, no optimistic-lock version - isActive is its
// hide/show toggle. `type` stays free text (Publication/Project/Patent/...)
// rather than an enum, per the Department CMS design decision to reuse this
// one model for Publications, Projects and Patents.
export class CreateResearchDto {
  @IsString()
  @MaxLength(300)
  title: string;

  @IsString()
  @MaxLength(300)
  authors: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  journal?: string;

  @IsInt()
  @Min(1900)
  year: number;

  // Legacy free-text department label, kept for display fallback when no
  // departmentId is set. Populated from the linked department's name when
  // departmentId is provided, so admins don't have to type it twice.
  @IsOptional()
  @IsString()
  @MaxLength(120)
  department?: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsString()
  @MaxLength(40)
  type: string;

  @IsOptional()
  @IsString()
  doiOrLink?: string;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsOptional()
  @IsString()
  attachmentUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
