import { Module } from '@nestjs/common';
import { DepartmentDisplaySettingsController } from './department-display-settings.controller';
import { DepartmentDisplaySettingsService } from './department-display-settings.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [DepartmentDisplaySettingsController],
  providers: [DepartmentDisplaySettingsService],
})
export class DepartmentDisplaySettingsModule {}
