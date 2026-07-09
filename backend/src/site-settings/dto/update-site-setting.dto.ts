import { PartialType } from '@nestjs/swagger';
import { CreateSiteSettingDto } from './create-site-setting.dto';

// No version field - SiteSetting deliberately has no soft-delete/optimistic
// lock columns (system config, not content). Last write wins.
export class UpdateSiteSettingDto extends PartialType(CreateSiteSettingDto) {}
