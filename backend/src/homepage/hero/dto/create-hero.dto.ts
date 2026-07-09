import {
  IsArray,
  IsBoolean,
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

  @IsPathOrUrl()
  videoUrl: string;

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
