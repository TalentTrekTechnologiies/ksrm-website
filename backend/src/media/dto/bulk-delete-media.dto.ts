import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional } from 'class-validator';

export class BulkDeleteMediaDto {
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  ids: number[];

  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
