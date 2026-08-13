import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ContentStyleItemDto {
  @IsString()
  @MaxLength(60)
  module: string;

  @IsInt()
  @Min(1)
  recordId: number;

  @IsString()
  @MaxLength(60)
  field: string;

  /**
   * Both nullable, and null is meaningful: it clears the setting. An omitted
   * key would leave the column as it was, so "Clear formatting" would appear
   * to work and change nothing.
   */
  @IsOptional()
  @IsString()
  @MaxLength(20)
  fontSize?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  color?: string | null;
}

export class UpsertContentStylesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContentStyleItemDto)
  items: ContentStyleItemDto[];
}
