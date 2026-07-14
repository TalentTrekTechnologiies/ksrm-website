import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { DepartmentsController } from './departments.controller';
import { DepartmentsService } from './departments.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [AuditLogModule, MediaModule],
  controllers: [DepartmentsController],
  providers: [DepartmentsService],
})
export class DepartmentsModule {}
