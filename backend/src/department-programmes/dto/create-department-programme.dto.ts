import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ProgrammeLevel } from '@prisma/client';

export class CreateDepartmentProgrammeDto {
  @IsInt()
  departmentId: number;

  @IsString()
  name: string;

  @IsEnum(ProgrammeLevel)
  level: ProgrammeLevel;

  @IsInt()
  @Min(0)
  intake: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
