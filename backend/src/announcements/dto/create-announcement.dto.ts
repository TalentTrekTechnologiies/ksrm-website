import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { AnnouncementPriority, AnnouncementSource } from '@prisma/client';
import { AnnouncementPlacementDto } from './announcement-placement.dto';

export class CreateAnnouncementDto {
  @IsString()
  @MaxLength(300)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  shortText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  badge?: string;

  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @IsOptional()
  @IsEnum(AnnouncementSource)
  source?: AnnouncementSource;

  @IsOptional()
  @IsString()
  sourceModule?: string;

  @IsOptional()
  @IsInt()
  sourceRecordId?: number;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(500)
  linkUrl?: string;

  @IsOptional()
  @IsBoolean()
  openInNewTab?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // Where this announcement appears - full-replace semantics on update
  // (same pattern AdminsService.assignRoles() already uses for AdminRole).
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => AnnouncementPlacementDto)
  placements?: AnnouncementPlacementDto[];
}
