import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateLabDto } from './create-lab.dto';

export class UpdateLabDto extends PartialType(
  OmitType(CreateLabDto, ['mediaId'] as const),
) {
  @IsInt()
  @Min(1)
  version: number;

  @IsOptional()
  @IsInt()
  mediaId?: number | null;
}
