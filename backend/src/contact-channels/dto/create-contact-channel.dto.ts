import { IsArray, IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

// Serves both the global office directory (departmentId omitted/null -
// Principal/Admissions/Exam/Placement/Main) and a single department's
// Contact Information section (departmentId set) - one reusable model.
export class CreateContactChannelDto {
  @IsOptional()
  @IsInt()
  departmentId?: number;

  // Only meaningful for the global directory - see the schema comment on
  // ContactChannel.group. A department's Contact tab never sends this and
  // the column default ("directory") is what it means there.
  @IsOptional()
  @IsIn(['info', 'directory'])
  group?: string;

  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phones?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emails?: string[];

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  mapEmbedUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
