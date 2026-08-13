import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReorderLearningOutcomeItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

export class ReorderLearningOutcomesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderLearningOutcomeItemDto)
  items: ReorderLearningOutcomeItemDto[];
}
