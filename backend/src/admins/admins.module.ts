import { Module } from '@nestjs/common';
import { AdminsController } from './admins.controller';
import { AdminsService } from './admins.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AdminNotificationsModule } from '../admin-notifications/admin-notifications.module';

@Module({
  imports: [AuditLogModule, AdminNotificationsModule],
  controllers: [AdminsController],
  providers: [AdminsService],
})
export class AdminsModule {}
