import { IsString, MaxLength } from 'class-validator';

export class UpdateApplicationNotesDto {
  @IsString()
  @MaxLength(2000)
  notes: string;
}
