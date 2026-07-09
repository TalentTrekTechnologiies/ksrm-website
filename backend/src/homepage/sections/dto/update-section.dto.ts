import { IsEnum, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SectionStatus } from '@prisma/client';
import { VisionContentDto } from './vision-content.dto';
import { MissionContentDto } from './mission-content.dto';
import { AboutContentDto } from './about-content.dto';
import { AdmissionsContentDto } from './admissions-content.dto';

// One small wrapper class per section key rather than a single generic
// `content: object` DTO validated by hand - each key's content shape is
// fixed and known at compile time, so a real typed/validated nested DTO per
// key is simpler and safer than programmatic validation dispatched on a
// runtime :key route param.
export class UpdateVisionSectionDto {
  @ValidateNested()
  @Type(() => VisionContentDto)
  content: VisionContentDto;

  @IsEnum(SectionStatus)
  status: SectionStatus;

  @IsInt()
  @Min(1)
  version: number;
}

export class UpdateMissionSectionDto {
  @ValidateNested()
  @Type(() => MissionContentDto)
  content: MissionContentDto;

  @IsEnum(SectionStatus)
  status: SectionStatus;

  @IsInt()
  @Min(1)
  version: number;
}

export class UpdateAboutSectionDto {
  @ValidateNested()
  @Type(() => AboutContentDto)
  content: AboutContentDto;

  @IsEnum(SectionStatus)
  status: SectionStatus;

  @IsInt()
  @Min(1)
  version: number;
}

export class UpdateAdmissionsSectionDto {
  @ValidateNested()
  @Type(() => AdmissionsContentDto)
  content: AdmissionsContentDto;

  @IsEnum(SectionStatus)
  status: SectionStatus;

  @IsInt()
  @Min(1)
  version: number;
}
