import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MediaType } from '@prisma/client';

function splitTags({ value }: { value: unknown }): string[] | undefined {
  if (typeof value !== 'string') return undefined;
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

function toBool({ value }: { value: unknown }): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export class QueryMediaDto {
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  folderId?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(splitTags)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  includeDeleted?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 24;
}
