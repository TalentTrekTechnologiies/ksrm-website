import { PartialType, OmitType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { CreateResearchDto } from './create-research.dto';

export class UpdateResearchDto extends PartialType(
  OmitType(CreateResearchDto, ['mediaId'] as const),
) {
  // Nullable on update so the attachment can be explicitly cleared
  // (null) without touching it (undefined) - matches the established
  // mediaId-nullable pattern used across every other Media Library field.
  @IsOptional()
  @IsInt()
  mediaId?: number | null;
}
