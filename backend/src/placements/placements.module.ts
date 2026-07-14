import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { PlacementsService } from './placements.service';
import { PlacementsController } from './placements.controller';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [AuditLogModule, MediaModule],
  controllers: [PlacementsController],
  providers: [PlacementsService],
})
export class PlacementsModule {}
