import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateCampusVideoDto } from './create-campus-video.dto';

export class UpdateCampusVideoDto extends PartialType(CreateCampusVideoDto) {
  @IsInt()
  @Min(1)
  version: number;
}
