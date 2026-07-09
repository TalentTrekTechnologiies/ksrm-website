import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateCommitteeMemberDto {
  @IsString()
  name: string;

  @IsString()
  designation: string;

  @IsString()
  role: string;

  @IsOptional()
  @IsInt()
  facultyId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
