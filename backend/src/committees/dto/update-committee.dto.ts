import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateCommitteeDto } from './create-committee.dto';

export class UpdateCommitteeDto extends PartialType(CreateCommitteeDto) {
  @IsInt()
  @Min(1)
  version: number;
}
