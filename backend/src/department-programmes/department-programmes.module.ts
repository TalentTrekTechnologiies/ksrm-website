import { Module } from '@nestjs/common';
import { DepartmentProgrammesController } from './department-programmes.controller';
import { DepartmentProgrammesService } from './department-programmes.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [DepartmentProgrammesController],
  providers: [DepartmentProgrammesService],
})
export class DepartmentProgrammesModule {}
