import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  name: string;

  @IsString()
  designation: string;

  @IsString()
  qualification: string;

  @IsString()
  department: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsOptional()
  @IsBoolean()
  isHod?: boolean;

  @IsOptional()
  @IsString()
  welcomeMessage?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
