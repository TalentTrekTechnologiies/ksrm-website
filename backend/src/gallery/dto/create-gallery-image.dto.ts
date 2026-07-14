import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateGalleryImageDto {
  @IsString()
  title: string;

  // Legacy hand-typed fallback - stays required so a raw URL always works
  // without the Media Library. When mediaId is also set, the server
  // resolves and overwrites this with the Media's current URL.
  @IsString()
  imageUrl: string;

  // Media Library reference - optional so the legacy imageUrl-only flow
  // keeps working unchanged. Pass `null` explicitly (on update) to unlink.
  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsOptional()
  @IsString()
  category?: string;

  // Optional page/section slug (edc, iic, library, ...) that surfaces this
  // image on that page's gallery block.
  @IsOptional()
  @IsString()
  pageSection?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsInt()
  departmentId?: number;
}
