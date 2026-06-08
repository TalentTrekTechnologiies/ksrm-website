import { IsString, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class CreateExamNotificationDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsString()
  category: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
