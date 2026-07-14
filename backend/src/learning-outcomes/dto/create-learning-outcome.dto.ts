import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { OutcomeType } from '@prisma/client';

// One model, one admin form, backing all three outcome types (PEO/PO/PSO)
// - `type` is the discriminator, matching "the department should be
// selected by the record, not by different code" applied one level down.
export class CreateLearningOutcomeDto {
  @IsInt()
  departmentId: number;

  @IsEnum(OutcomeType)
  type: OutcomeType;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  text: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
