import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePageTableDto {
  @IsString()
  @MaxLength(100)
  key: string;

  @IsString()
  @MaxLength(100)
  pageSection: string;

  @IsString()
  @MaxLength(200)
  title: string;

  /** Column headings, in order. */
  @IsArray()
  @IsString({ each: true })
  columns: string[];

  /** Row cells: an array of string arrays aligned to `columns`. Kept as `any`
   * because Prisma stores it as Json - shape is validated in the service. */
  @IsArray()
  rows: string[][];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  footnote?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
