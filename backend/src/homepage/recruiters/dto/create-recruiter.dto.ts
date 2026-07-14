import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsPathOrUrl } from '../../dto/is-path-or-url.validator';

export class CreateRecruiterDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsPathOrUrl()
  logoUrl: string;

  @IsOptional()
  @IsInt()
  mediaId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
