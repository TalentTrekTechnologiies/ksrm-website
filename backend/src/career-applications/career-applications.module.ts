import { Module } from '@nestjs/common';
import { CareerApplicationsController } from './career-applications.controller';
import { CareerApplicationsService } from './career-applications.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { MediaModule } from '../media/media.module';
import { MailerModule } from '../mailer/mailer.module';
import { AdminNotificationsModule } from '../admin-notifications/admin-notifications.module';

@Module({
  imports: [
    AuditLogModule,
    MediaModule,
    MailerModule,
    AdminNotificationsModule,
  ],
  controllers: [CareerApplicationsController],
  providers: [CareerApplicationsService],
})
export class CareerApplicationsModule {}
