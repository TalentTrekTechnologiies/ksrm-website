import { IsInt } from 'class-validator';

export class AssignHrDto {
  @IsInt()
  adminId: number;
}
