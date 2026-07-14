import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateAdminDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  // Explicit `null` clears the department scope (matches the mediaId:null
  // "unlink" convention used everywhere else in this codebase) - `undefined`
  // (the key omitted entirely) means "don't change", per Prisma's usual
  // update() semantics.
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsInt()
  departmentId?: number | null;

  @IsInt()
  @Min(1)
  version: number;
}
