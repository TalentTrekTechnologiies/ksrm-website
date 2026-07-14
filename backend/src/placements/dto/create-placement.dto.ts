import { IsBoolean, IsString, IsNumber, IsOptional, IsInt } from 'class-validator';

export class CreatePlacementDto {
  @IsString()
  studentName: string;

  @IsString()
  company: string;

  @IsString()
  package: string;

  @IsString()
  department: string;

  @IsNumber()
  year: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsOptional()
  @IsString()
  companyLogoUrl?: string;

  @IsOptional()
  @IsInt()
  companyLogoMediaId?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
