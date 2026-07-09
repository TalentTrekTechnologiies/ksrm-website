import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateAdmissionProgramDto } from './create-admission-program.dto';

export class UpdateAdmissionProgramDto extends PartialType(CreateAdmissionProgramDto) {
  @IsInt()
  @Min(1)
  version: number;
}
