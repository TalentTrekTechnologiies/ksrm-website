import { PartialType } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { CreatePageTableDto } from './create-page-table.dto';

export class UpdatePageTableDto extends PartialType(CreatePageTableDto) {
  /** Optimistic lock - required, matching every other module's update DTO, so a
   * concurrent edit is rejected rather than silently overwriting. */
  @IsInt()
  version: number;
}
