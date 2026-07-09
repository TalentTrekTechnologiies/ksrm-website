import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateAccreditationBadgeDto } from './create-accreditation-badge.dto';

export class UpdateAccreditationBadgeDto extends PartialType(
  CreateAccreditationBadgeDto,
) {
  @IsInt()
  @Min(1)
  version: number;
}
