import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { PlacementsService } from './placements.service';
import { PlacementsController } from './placements.controller';

@Module({
  imports: [AuditLogModule],
  controllers: [PlacementsController],
  providers: [PlacementsService],
})
export class PlacementsModule {}
