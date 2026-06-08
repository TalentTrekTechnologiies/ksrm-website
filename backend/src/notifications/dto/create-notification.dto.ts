import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  text: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
