import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateEventDto } from './create-event.dto';

export class UpdateEventDto extends PartialType(
  OmitType(CreateEventDto, ['mediaId'] as const),
) {
  @IsInt()
  @Min(1)
  version: number;

  @IsOptional()
  @IsInt()
  mediaId?: number | null;
}
