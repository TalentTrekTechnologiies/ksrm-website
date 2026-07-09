import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateCommitteeMemberDto } from './create-committee-member.dto';

export class UpdateCommitteeMemberDto extends PartialType(CreateCommitteeMemberDto) {
  @IsInt()
  @Min(1)
  version: number;
}
