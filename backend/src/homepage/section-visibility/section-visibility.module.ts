import { Module } from '@nestjs/common';
import { AuditLogModule } from '../../audit-log/audit-log.module';
import { SectionVisibilityController } from './section-visibility.controller';
import { SectionVisibilityService } from './section-visibility.service';

// Its own module (not just a provider inside HomepageModule) so NewsModule
// can also import it - the Latest News homepage section's visibility flag
// lives in the same SiteSetting-backed mechanism as every other Sprint 1C
// section, and NewsController needs it too.
@Module({
  imports: [AuditLogModule],
  controllers: [SectionVisibilityController],
  providers: [SectionVisibilityService],
  exports: [SectionVisibilityService],
})
export class SectionVisibilityModule {}
