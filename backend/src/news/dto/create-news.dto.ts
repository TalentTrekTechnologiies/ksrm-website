import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

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

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  // Optional video and document attachments, alongside the existing image.
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsInt()
  videoMediaId?: number | null;

  @IsOptional()
  @IsString()
  documentUrl?: string;

  @IsOptional()
  @IsInt()
  documentMediaId?: number | null;
}
