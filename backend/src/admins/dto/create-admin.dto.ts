import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;

  @IsOptional()
  @IsInt()
  departmentId?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  roleIds?: number[];

  // Only a real super admin (RequestAdmin.isSuperAdmin, not merely someone
  // holding admins.create) may set this true - enforced in AdminsService,
  // not just this DTO, since a DTO-level check can't see the caller's
  // identity. See AdminsService.create() for why.
  @IsOptional()
  @IsBoolean()
  isSuperAdmin?: boolean;
}
