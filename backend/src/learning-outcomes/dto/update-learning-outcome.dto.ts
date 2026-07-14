import { PartialType } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { CreateLearningOutcomeDto } from './create-learning-outcome.dto';

export class UpdateLearningOutcomeDto extends PartialType(CreateLearningOutcomeDto) {
  @IsInt()
  @Min(1)
  version: number;
}
