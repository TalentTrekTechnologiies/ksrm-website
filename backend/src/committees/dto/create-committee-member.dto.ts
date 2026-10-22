import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCommitteeMemberDto {
  @IsString()
  name: string;

  @IsString()
  designation: string;

  @IsString()
  role: string;

  // Department or body the member belongs to - "H&S", "CIVIL", "Library",
  // "NGO". Optional: not every roster breaks members down that way.
  @IsOptional()
  @IsString()
  @MaxLength(60)
  department?: string;

  // Starts a group heading at this member ("Senior Teachers"); members after it
  // stay in that group until the next one with a heading. Used by the IQAC
  // composition, whose roster is grouped by category.
  @IsOptional()
  @IsString()
  @MaxLength(120)
  groupLabel?: string;

  // Published contact number. A cell that exists to be reached needs one.
  @IsOptional()
  @IsString()
  @MaxLength(40)
  contact?: string;

  @IsOptional()
  @IsInt()
  facultyId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
