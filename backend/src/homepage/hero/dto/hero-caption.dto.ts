import { IsString, MaxLength } from 'class-validator';

export class HeroCaptionDto {
  @IsString()
  @MaxLength(80)
  label: string;

  @IsString()
  @MaxLength(200)
  text: string;
}
