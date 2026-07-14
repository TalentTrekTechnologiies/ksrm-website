import { Module } from '@nestjs/common';
import { ResearchController } from './research.controller';
import { ResearchService } from './research.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [AuditLogModule, MediaModule],
  controllers: [ResearchController],
  providers: [ResearchService],
})
export class ResearchModule {}
