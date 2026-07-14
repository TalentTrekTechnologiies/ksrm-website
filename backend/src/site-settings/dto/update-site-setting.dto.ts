import { OmitType, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';
import { CreateSiteSettingDto } from './create-site-setting.dto';

// No version field - SiteSetting deliberately has no soft-delete/optimistic
// lock columns (system config, not content). Last write wins.
export class UpdateSiteSettingDto extends PartialType(
  OmitType(CreateSiteSettingDto, ['mediaId'] as const),
) {
  @IsOptional()
  @IsInt()
  mediaId?: number | null;
}
