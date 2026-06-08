import { IsString, IsNumber, IsOptional } from 'class-validator';

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
}
