import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateGalleryDto {
  @IsString()
  title: string;

  @IsString()
  imageUrl: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
