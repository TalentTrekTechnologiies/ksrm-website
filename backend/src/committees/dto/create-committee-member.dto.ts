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
