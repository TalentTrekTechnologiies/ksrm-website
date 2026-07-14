import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

function splitTags({ value }: { value: unknown }): string[] | undefined {
  if (Array.isArray(value)) return value as string[];
  if (typeof value !== 'string') return undefined;
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export class UpdateMediaDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  altText?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  copyright?: string;

  @IsOptional()
  @IsString()
  photographer?: string;

  /** Pass `null` explicitly to move the item to the root (no folder). */
  @IsOptional()
  @IsInt()
  folderId?: number | null;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @Transform(splitTags)
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsInt()
  version: number;
}
