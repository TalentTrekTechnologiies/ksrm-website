import { IsArray, IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  subtitle?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  eventDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  prizePool?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  organizerName?: string;

  /** Null is a college-wide event; a Student Chapter's own events set this. */
  @IsOptional()
  @IsInt()
  departmentId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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
