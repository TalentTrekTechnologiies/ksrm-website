import { ArrayMinSize, IsArray, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MissionItemDto {
  @IsString()
  @MaxLength(10)
  code: string;

  @IsString()
  @MaxLength(400)
  text: string;
}

export class MissionContentDto {
  @IsString()
  @MaxLength(60)
  label: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MissionItemDto)
  missions: MissionItemDto[];
}
