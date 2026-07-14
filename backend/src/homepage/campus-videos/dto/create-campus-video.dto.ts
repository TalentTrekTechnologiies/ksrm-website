import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsPathOrUrl } from '../../dto/is-path-or-url.validator';

export class CreateCampusVideoDto {
  @IsString()
  @MaxLength(150)
  title: string;

  @IsPathOrUrl()
  youtubeUrl: string;

  // Omitted/undefined -> the global homepage Campus Videos collection
  // (unchanged default behavior). Set -> this video belongs to one
  // department's Videos section instead.
  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  badgeLabel?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
