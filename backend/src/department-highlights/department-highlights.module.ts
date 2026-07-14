import { Module } from '@nestjs/common';
import { DepartmentHighlightsController } from './department-highlights.controller';
import { DepartmentHighlightsService } from './department-highlights.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [AuditLogModule, MediaModule],
  controllers: [DepartmentHighlightsController],
  providers: [DepartmentHighlightsService],
})
export class DepartmentHighlightsModule {}
