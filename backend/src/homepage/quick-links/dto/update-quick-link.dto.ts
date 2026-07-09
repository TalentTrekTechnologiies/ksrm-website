import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateQuickLinkDto } from './create-quick-link.dto';

export class UpdateQuickLinkDto extends PartialType(CreateQuickLinkDto) {
  @IsInt()
  @Min(1)
  version: number;
}
