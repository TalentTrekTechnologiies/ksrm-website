import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateCareerDto } from './create-career.dto';

export class UpdateCareerDto extends PartialType(CreateCareerDto) {
  @IsInt()
  @Min(1)
  version: number;
}
