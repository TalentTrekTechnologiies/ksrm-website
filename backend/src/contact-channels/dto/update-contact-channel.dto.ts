import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateContactChannelDto } from './create-contact-channel.dto';

export class UpdateContactChannelDto extends PartialType(
  CreateContactChannelDto,
) {
  @IsInt()
  @Min(1)
  version: number;
}
