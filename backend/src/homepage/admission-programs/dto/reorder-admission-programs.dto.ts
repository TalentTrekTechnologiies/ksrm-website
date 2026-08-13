import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ADMISSION_PROGRAM_SECTIONS } from './create-admission-program.dto';
import type { AdmissionProgramSection } from './create-admission-program.dto';

class ReorderAdmissionProgramItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderAdmissionProgramsDto {
  @IsIn(ADMISSION_PROGRAM_SECTIONS)
  section: AdmissionProgramSection;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderAdmissionProgramItemDto)
  items: ReorderAdmissionProgramItemDto[];
}
