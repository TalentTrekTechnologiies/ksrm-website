import {
  ArrayMinSize,
  IsArray,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReorderExamNotificationItemDto {
  @IsInt()
  id: number;

  @IsInt()
  @Min(0)
  sortOrder: number;
}

/**
 * Drag-to-reorder payload: the full list in its new order.
 * Mirrors ReorderFacultyDto so both modules validate identically.
 */
export class ReorderExamNotificationsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReorderExamNotificationItemDto)
  items: ReorderExamNotificationItemDto[];
}
