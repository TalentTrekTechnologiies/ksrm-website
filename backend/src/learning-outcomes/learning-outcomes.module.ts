import { Module } from '@nestjs/common';
import { LearningOutcomesController } from './learning-outcomes.controller';
import { LearningOutcomesService } from './learning-outcomes.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [LearningOutcomesController],
  providers: [LearningOutcomesService],
})
export class LearningOutcomesModule {}
