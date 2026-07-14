import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateMediaFolderDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  /** Set to move the folder under a different parent; pass `null`
   * explicitly to move it to the root. */
  @IsOptional()
  @IsInt()
  parentId?: number | null;
}
