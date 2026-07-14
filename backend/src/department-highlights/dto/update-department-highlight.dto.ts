import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateDepartmentHighlightDto } from './create-department-highlight.dto';

export class UpdateDepartmentHighlightDto extends PartialType(
  OmitType(CreateDepartmentHighlightDto, ['mediaId'] as const),
) {
  @IsInt()
  @Min(1)
  version: number;

  @IsOptional()
  @IsInt()
  mediaId?: number | null;
}
