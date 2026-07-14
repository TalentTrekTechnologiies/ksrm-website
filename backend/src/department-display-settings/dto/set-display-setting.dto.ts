import { IsBoolean, IsInt, IsString, MaxLength } from 'class-validator';

export class SetDisplaySettingDto {
  @IsInt()
  departmentId: number;

  @IsString()
  @MaxLength(80)
  key: string;

  @IsBoolean()
  value: boolean;
}
