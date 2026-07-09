import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsPathOrUrl } from '../../dto/is-path-or-url.validator';

export class AboutStatDto {
  @IsString()
  @MaxLength(20)
  num: string;

  @IsString()
  @MaxLength(60)
  label: string;
}

export class AboutHighlightDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}

export class AboutImageDto {
  @IsPathOrUrl()
  url: string;

  @IsString()
  @MaxLength(150)
  alt: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  caption?: string;
}

export class AboutCtaDto {
  @IsString()
  @MaxLength(60)
  text: string;

  @IsPathOrUrl()
  href: string;
}

export class AboutContentDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  eyebrow?: string;

  @IsString()
  @MaxLength(150)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  subtitle?: string;

  // Array, not a fixed count - editors add/remove paragraphs without a
  // schema change, per your explicit "don't hardcode layout assumptions
  // into content" note.
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  paragraphs: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AboutHighlightDto)
  highlights?: AboutHighlightDto[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AboutStatDto)
  statistics: AboutStatDto[];

  // Single source of truth for every "N+ years" reference (the floating
  // badge computes currentYear - foundingYear) - fixes the pre-CMS bug
  // where 1980 was hardcoded independently in two places.
  @IsInt()
  @Min(1900)
  @Max(2100)
  foundingYear: number;

  @ValidateNested()
  @Type(() => AboutImageDto)
  image: AboutImageDto;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  badgeLabel?: string;

  @ValidateNested()
  @Type(() => AboutCtaDto)
  cta: AboutCtaDto;
}
