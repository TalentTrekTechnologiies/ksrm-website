import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DisplaySettingItemDto {
  @IsString()
  @MaxLength(80)
  key: string;

  @IsBoolean()
  value: boolean;
}

export class BulkSetDisplaySettingsDto {
  @IsInt()
  departmentId: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => DisplaySettingItemDto)
  settings: DisplaySettingItemDto[];
}
