import { PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTransportRouteDto {
  @IsString()
  @MaxLength(20)
  routeNo: string;

  @IsString()
  @MaxLength(200)
  fromPlace: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  via?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  departTime?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  returnTime?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  fee?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  busNo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  driverName?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  driverPhone?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateTransportRouteDto extends PartialType(
  CreateTransportRouteDto,
) {
  @IsInt()
  @Min(1)
  version: number;
}

export class ReorderTransportRoutesDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}
