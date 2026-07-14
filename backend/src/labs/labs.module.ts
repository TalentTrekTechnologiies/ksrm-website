import { Module } from '@nestjs/common';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [AuditLogModule, MediaModule],
  controllers: [LabsController],
  providers: [LabsService],
})
export class LabsModule {}
