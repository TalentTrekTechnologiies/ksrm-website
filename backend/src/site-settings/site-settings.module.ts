import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SiteSettingsController } from './site-settings.controller';
import { SiteSettingsService } from './site-settings.service';
import { MediaModule } from '../media/media.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [AuditLogModule, MediaModule, MailerModule],
  controllers: [SiteSettingsController],
  providers: [SiteSettingsService],
})
export class SiteSettingsModule {}
