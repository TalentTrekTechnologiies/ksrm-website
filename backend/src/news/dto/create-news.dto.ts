import {
  IsBoolean,
  IsOptional,
  IsString,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @MaxLength(300)
  title: string;

  @IsString()
  content: string;

  @IsString()
  @MaxLength(80)
  category: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}
