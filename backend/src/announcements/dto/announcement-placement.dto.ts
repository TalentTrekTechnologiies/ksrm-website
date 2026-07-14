import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { AnnouncementLocation } from '@prisma/client';

export class AnnouncementPlacementDto {
  @IsEnum(AnnouncementLocation)
  location: AnnouncementLocation;

  // Only meaningful for DEPARTMENT_PAGE - omit for "all departments" or for
  // any other location.
  @IsOptional()
  @IsInt()
  departmentId?: number;
}
