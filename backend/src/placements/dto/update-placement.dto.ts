import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreatePlacementDto } from './create-placement.dto';

export class UpdatePlacementDto extends PartialType(
  OmitType(CreatePlacementDto, ['mediaId', 'companyLogoMediaId'] as const),
) {
  @IsInt()
  @Min(1)
  version: number;

  @IsOptional()
  @IsInt()
  mediaId?: number | null;

  @IsOptional()
  @IsInt()
  companyLogoMediaId?: number | null;
}
