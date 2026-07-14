import { Module } from '@nestjs/common';
import { ExamNotificationsService } from './exam-notifications.service';
import { ExamNotificationsController } from './exam-notifications.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [ExamNotificationsController],
  providers: [ExamNotificationsService],
})
export class ExamNotificationsModule {}
