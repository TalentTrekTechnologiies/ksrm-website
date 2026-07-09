import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateDownloadDto } from './create-download.dto';

export class UpdateDownloadDto extends PartialType(CreateDownloadDto) {
  @IsInt()
  @Min(1)
  version: number;
}
