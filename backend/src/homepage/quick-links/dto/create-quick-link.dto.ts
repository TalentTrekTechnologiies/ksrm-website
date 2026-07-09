import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsPathOrUrl } from '../../dto/is-path-or-url.validator';

// Only one section value in Sprint 1A - CampusServices' "Digital Campus
// Services" grid. Kept as an @IsIn allow-list (matching Statistics' `scope`
// pattern) rather than a free string so later sprints add new allowed
// values deliberately instead of a typo silently creating an orphaned
// section the public site never queries.
export const QUICK_LINK_SECTIONS = ['homepage_quick_links'] as const;
export type QuickLinkSection = (typeof QUICK_LINK_SECTIONS)[number];

export class CreateQuickLinkDto {
  @IsIn(QUICK_LINK_SECTIONS)
  section: QuickLinkSection;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  icon?: string;

  // Required (not just nullable-in-schema) - every existing quick link card
  // has a poster image, and a card with no image is a broken-looking tile,
  // not a valid partial state.
  @IsPathOrUrl()
  imageUrl: string;

  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];

  @IsPathOrUrl()
  linkUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  linkText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
