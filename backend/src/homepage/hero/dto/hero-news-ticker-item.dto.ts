import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsPathOrUrl } from '../../dto/is-path-or-url.validator';

export class HeroNewsTickerItemDto {
  @IsBoolean()
  isNew: boolean;

  @IsString()
  @MaxLength(40)
  date: string;

  @IsString()
  @MaxLength(200)
  text: string;

  @IsOptional()
  @IsPathOrUrl()
  href?: string;
}
