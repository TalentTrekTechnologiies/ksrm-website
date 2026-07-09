import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CommitteeType } from '@prisma/client';

export class CreateCommitteeDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsEnum(CommitteeType)
  type: CommitteeType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
