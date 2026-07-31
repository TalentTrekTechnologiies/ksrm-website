import { ArrayMinSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ReorderFacultyItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

/** Drag-to-reorder payload: the full list in its new order. */
export class ReorderFacultyDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderFacultyItemDto)
  items: ReorderFacultyItemDto[];
}
