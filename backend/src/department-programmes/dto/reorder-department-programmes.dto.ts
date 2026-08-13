import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReorderDepartmentProgrammeItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderDepartmentProgrammesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderDepartmentProgrammeItemDto)
  items: ReorderDepartmentProgrammeItemDto[];
}
