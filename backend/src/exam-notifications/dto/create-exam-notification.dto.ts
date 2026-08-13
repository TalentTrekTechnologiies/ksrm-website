import { ExamNotificationType } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsInt,
  MaxLength,
} from 'class-validator';

// Deliberately simple - this module publishes important links (Hall
// Ticket, Results, Registration, Exam Schedule, Important Notice), it is
// not a general notification engine. fileUrl/category/date are legacy
// Phase 1 columns no longer written here - see the ExamNotification model
// comment in schema.prisma.
export class CreateExamNotificationDto {
  /// Which list on the Examinations page this lands in. Defaults to a plain
  /// notification so existing callers keep working unchanged.
  @IsOptional()
  @IsEnum(ExamNotificationType)
  type?: ExamNotificationType;

  @IsOptional()
  @IsInt()
  mediaId?: number | null;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  buttonText?: string;

  @IsOptional()
  @IsString()
  buttonUrl?: string;

  // Academic year label, e.g. "AY 2026-27". Free text so rolling to a new year
  // is just a typed value - the public list groups by it, newest first.
  @IsOptional()
  @IsString()
  @MaxLength(20)
  academicYear?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
