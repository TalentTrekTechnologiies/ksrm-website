import { IsEmail, IsString, MinLength, IsArray, IsOptional } from 'class-validator';

export class RegisterAdminDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsArray()
  permissions: string[];

  @IsOptional()
  @IsString()
  department?: string;
}
