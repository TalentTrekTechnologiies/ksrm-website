import { Module } from '@nestjs/common';
import { ExamNotificationsService } from './exam-notifications.service';
import { ExamNotificationsController } from './exam-notifications.controller';

@Module({
  controllers: [ExamNotificationsController],
  providers: [ExamNotificationsService],
})
export class ExamNotificationsModule {}
