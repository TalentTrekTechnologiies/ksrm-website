import { IsBoolean } from 'class-validator';

export class UpdateSectionVisibilityDto {
  @IsBoolean()
  visible: boolean;
}
