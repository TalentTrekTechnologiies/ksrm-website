import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SectionVisibilityModule } from '../homepage/section-visibility/section-visibility.module';

@Module({
  imports: [AuditLogModule, SectionVisibilityModule],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
