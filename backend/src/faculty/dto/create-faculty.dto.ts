import { IsString, IsOptional, IsBoolean } from 'class-validator';

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
  photoUrl?: string;

  @IsOptional()
  @IsBoolean()
  isHod?: boolean;
}
