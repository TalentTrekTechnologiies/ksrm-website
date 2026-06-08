import { IsString, IsNumber } from 'class-validator';

export class CreateDegreeVerificationDto {
  @IsString()
  studentName: string;

  @IsString()
  hallTicketNo: string;

  @IsString()
  department: string;

  @IsNumber()
  yearOfPassing: number;

  @IsString()
  degree: string;
}

export class VerifyDegreeDto {
  @IsString()
  hallTicketNo: string;

  @IsString()
  studentName: string;
}
