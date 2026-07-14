import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

function splitSkills({ value }: { value: unknown }): string[] | undefined {
  if (typeof value !== 'string') return undefined;
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// Multipart form fields always arrive as strings - numeric/array fields
// need explicit transforms (see UploadMediaDto for the established
// pattern this mirrors). The resume file itself is handled separately via
// @UploadedFile(), not part of this DTO.
export class SubmitCareerApplicationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  careerId?: number;

  @IsString()
  @MaxLength(150)
  fullName: string;

  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsPhoneNumber('IN')
  mobile: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsString()
  @MaxLength(200)
  qualification: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  specialization?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  yearsOfExperience?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  currentCompany?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  currentCtc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  expectedCtc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  noticePeriod?: string;

  @IsOptional()
  @IsArray()
  @Transform(splitSkills)
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsUrl()
  @MaxLength(300)
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(300)
  portfolioUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  coverLetter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  additionalNotes?: string;
}
