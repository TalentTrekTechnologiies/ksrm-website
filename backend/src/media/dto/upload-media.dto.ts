import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

function splitTags({ value }: { value: unknown }): string[] | undefined {
  if (typeof value !== 'string') return undefined;
  return value
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

export class UploadMediaDto {
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

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  folderId?: number;

  @IsOptional()
  @IsString()
  category?: string;

  /** Multipart fields always arrive as strings - accepts a comma-separated
   * list and turns it into an array before validation runs. Doubles as the
   * SEO "Keywords" field the metadata panel exposes. */
  @IsOptional()
  @Transform(splitTags)
  @IsString({ each: true })
  tags?: string[];
}
