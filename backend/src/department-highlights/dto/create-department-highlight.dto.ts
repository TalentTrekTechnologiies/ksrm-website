import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { DepartmentHighlightKind } from '@prisma/client';

// One model, one admin form, backing both the "AI-Enabled Highlights" promo
// cards and the Achievements section - `kind` is the discriminator.
export class CreateDepartmentHighlightDto {
  @IsInt()
  departmentId: number;

  @IsEnum(DepartmentHighlightKind)
  kind: DepartmentHighlightKind;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
