import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

function splitTags({ value }: { value: unknown }): string[] | undefined {
  if (typeof value !== 'string') return undefined;
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Shared metadata applied to every file in a bulk-upload batch - unlike a
 * single upload, per-file title/altText/caption don't make sense shared
 * across a batch of unrelated files, so those are excluded here. */
export class BulkUploadMediaDto {
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
}
