import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsPathOrUrl } from '../../dto/is-path-or-url.validator';
import { HeroCaptionDto } from './hero-caption.dto';
import { HeroNewsTickerItemDto } from './hero-news-ticker-item.dto';

export class CreateHeroDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  accreditationLabel?: string;

  @IsString()
  @MaxLength(200)
  heading: string;

  @IsString()
  @MaxLength(300)
  subtitle: string;

  // Legacy hand-typed fallback - stays required so a raw URL always works
  // without the Media Library. When mediaId is also set, the server
  // resolves and overwrites this with the Media's current URL (so a later
  // Replace propagates here automatically) - the value sent here is only
  // load-bearing when mediaId is absent.
  @IsPathOrUrl()
  videoUrl: string;

  // Media Library reference for the background video - optional so the
  // legacy videoUrl-only flow keeps working unchanged. Pass `null`
  // explicitly (on update) to unlink and fall back to manually editing
  // videoUrl again.
  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  ctaPrimaryText?: string;

  // Required whenever ctaPrimaryText is set - a CTA button with text but no
  // destination is a dead link, not a valid partial state.
  @ValidateIf((o: CreateHeroDto) => !!o.ctaPrimaryText)
  @IsPathOrUrl()
  ctaPrimaryHref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  ctaSecondaryText?: string;

  @ValidateIf((o: CreateHeroDto) => !!o.ctaSecondaryText)
  @IsPathOrUrl()
  ctaSecondaryHref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  panelLabel?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeroCaptionDto)
  captions?: HeroCaptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeroNewsTickerItemDto)
  newsTicker?: HeroNewsTickerItemDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
