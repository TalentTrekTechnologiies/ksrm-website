import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateTestimonialDto } from './create-testimonial.dto';

export class UpdateTestimonialDto extends PartialType(
  OmitType(CreateTestimonialDto, ['mediaId'] as const),
) {
  @IsInt()
  @Min(1)
  version: number;

  @IsOptional()
  @IsInt()
  mediaId?: number | null;
}
