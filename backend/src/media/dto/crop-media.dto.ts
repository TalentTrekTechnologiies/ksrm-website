import { Type } from 'class-transformer';
import { IsIn, IsInt, Min } from 'class-validator';
import { CROP_PRESET_KEYS } from '../constants/crop-presets';

export class CropMediaDto {
  @IsIn(CROP_PRESET_KEYS)
  cropPreset: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  x: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  y: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  width: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  height: number;
}
