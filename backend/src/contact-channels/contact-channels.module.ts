import { Module } from '@nestjs/common';
import { ContactChannelsController } from './contact-channels.controller';
import { ContactChannelsService } from './contact-channels.service';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [AuditLogModule],
  controllers: [ContactChannelsController],
  providers: [ContactChannelsService],
})
export class ContactChannelsModule {}
