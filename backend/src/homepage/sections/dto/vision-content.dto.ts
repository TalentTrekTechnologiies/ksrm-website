import { IsOptional, IsString, MaxLength } from 'class-validator';

export class VisionContentDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  eyebrow?: string;

  @IsString()
  @MaxLength(120)
  heading: string;

  @IsString()
  @MaxLength(60)
  label: string;

  @IsString()
  @MaxLength(600)
  text: string;
}
