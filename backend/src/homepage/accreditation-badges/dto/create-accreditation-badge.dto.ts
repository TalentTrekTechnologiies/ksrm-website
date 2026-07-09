import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsPathOrUrl } from '../../dto/is-path-or-url.validator';

export class CreateAccreditationBadgeDto {
  @IsString()
  @MaxLength(20)
  shortName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  grade?: string;

  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  subtext?: string;

  @IsOptional()
  @IsPathOrUrl()
  linkUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  linkText?: string;

  @IsPathOrUrl()
  imageUrl: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
