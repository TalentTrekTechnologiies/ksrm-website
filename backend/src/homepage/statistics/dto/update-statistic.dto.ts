import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateStatisticDto } from './create-statistic.dto';

export class UpdateStatisticDto extends PartialType(CreateStatisticDto) {
  @IsInt()
  @Min(1)
  version: number;
}
