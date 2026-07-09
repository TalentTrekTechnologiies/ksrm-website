import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateDepartmentCardDto } from './create-department-card.dto';

export class UpdateDepartmentCardDto extends PartialType(
  CreateDepartmentCardDto,
) {
  @IsInt()
  @Min(1)
  version: number;
}
