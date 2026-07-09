import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreatePlacementDto } from './create-placement.dto';

export class UpdatePlacementDto extends PartialType(CreatePlacementDto) {
  @IsInt()
  @Min(1)
  version: number;
}
