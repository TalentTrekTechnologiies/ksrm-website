import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { SiteSettingType } from '@prisma/client';

export class CreateSiteSettingDto {
  @IsString()
  @MaxLength(200)
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsEnum(SiteSettingType)
  type: SiteSettingType;

  @IsString()
  @MaxLength(100)
  group: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}
