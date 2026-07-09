import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateRecruiterDto } from './create-recruiter.dto';

export class UpdateRecruiterDto extends PartialType(CreateRecruiterDto) {
  @IsInt()
  @Min(1)
  version: number;
}
