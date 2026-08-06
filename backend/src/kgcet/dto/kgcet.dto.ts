import { PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateKgcetParticipationDto {
  /** The exam year as displayed. Text, so "2025-26" needs no schema change. */
  @IsString()
  @MaxLength(20)
  year: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  registered?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  attended?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  qualified?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateKgcetParticipationDto extends PartialType(CreateKgcetParticipationDto) {
  @IsInt()
  @Min(1)
  version: number;
}

export class CreateKgcetHighlightDto {
  /** A single emoji. Optional - a card without one is fine. */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  icon?: string | null;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(600)
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateKgcetHighlightDto extends PartialType(CreateKgcetHighlightDto) {
  @IsInt()
  @Min(1)
  version: number;
}

export class ReorderKgcetDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}
