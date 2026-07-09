import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateGalleryImageDto } from './create-gallery-image.dto';

export class UpdateGalleryImageDto extends PartialType(CreateGalleryImageDto) {
  @IsInt()
  @Min(1)
  version: number;
}
