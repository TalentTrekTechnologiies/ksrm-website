import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { CreateAdmissionProgramDto } from './create-admission-program.dto';

export class UpdateAdmissionProgramDto extends PartialType(
  OmitType(CreateAdmissionProgramDto, ['mediaId'] as const),
) {
  @IsInt()
  @Min(1)
  version: number;

  @IsOptional()
  @IsInt()
  mediaId?: number | null;
}
