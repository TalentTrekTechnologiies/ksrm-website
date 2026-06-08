import { Module } from '@nestjs/common';
import { DegreeVerificationService } from './degree-verification.service';
import { DegreeVerificationController } from './degree-verification.controller';

@Module({
  controllers: [DegreeVerificationController],
  providers: [DegreeVerificationService],
})
export class DegreeVerificationModule {}
