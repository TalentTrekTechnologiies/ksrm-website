import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateDepartmentProgrammeDto } from './create-department-programme.dto';

export class UpdateDepartmentProgrammeDto extends PartialType(CreateDepartmentProgrammeDto) {
  @IsInt()
  @Min(1)
  version: number;
}
