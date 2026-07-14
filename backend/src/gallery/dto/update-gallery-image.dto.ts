import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateGalleryImageDto } from './create-gallery-image.dto';

// mediaId is omitted from the base before PartialType is applied, then
// re-declared below with a wider `number | null` type - see
// update-hero.dto.ts for why (PartialType alone keeps it `number |
// undefined`, which can't express "explicitly unlink").
export class UpdateGalleryImageDto extends PartialType(
  OmitType(CreateGalleryImageDto, ['mediaId'] as const),
) {
  @IsInt()
  @Min(1)
  version: number;

  // Pass `null` explicitly to unlink from the Media Library and fall back
  // to manually editing imageUrl again.
  @IsOptional()
  @IsInt()
  mediaId?: number | null;
}
