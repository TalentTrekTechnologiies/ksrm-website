import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { DownloadCategory } from '@prisma/client';

/**
 * One file in a bulk publish. Only the parts that genuinely differ per
 * document live here - everything else is shared across the batch, which is
 * the whole point: publishing a semester's results should not mean filling
 * the same three dropdowns forty times.
 */
export class BulkDownloadItemDto {
  @IsString()
  @MaxLength(300)
  title: string;

  /**
   * Optional when `mediaId` is given - the server resolves a Media Library id
   * to its canonical file URL. This matters: media processing is asynchronous,
   * so a file's variants are still empty in the response right after upload
   * and the client has no URL to send. It has the id, which is enough.
   */
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsInt()
  mediaId?: number;
}

// A generous ceiling that still bounds the transaction - a semester's worth of
// results across every branch and year lands well inside it.
const MAX_ITEMS = 200;

export class BulkCreateDownloadsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_ITEMS)
  @ValidateNested({ each: true })
  @Type(() => BulkDownloadItemDto)
  items: BulkDownloadItemDto[];

  // --- applied to every item in the batch ---

  @IsEnum(DownloadCategory)
  category: DownloadCategory;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  pageSection?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  groupLabel?: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
