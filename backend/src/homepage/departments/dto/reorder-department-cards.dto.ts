import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DEPARTMENT_CARD_SECTIONS } from './create-department-card.dto';
import type { DepartmentCardSection } from './create-department-card.dto';

class ReorderDepartmentCardItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderDepartmentCardsDto {
  @IsIn(DEPARTMENT_CARD_SECTIONS)
  section: DepartmentCardSection;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderDepartmentCardItemDto)
  items: ReorderDepartmentCardItemDto[];
}
