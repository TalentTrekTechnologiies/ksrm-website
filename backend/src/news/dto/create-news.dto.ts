import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
