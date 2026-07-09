import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CommitteesController } from './committees.controller';
import { CommitteesService } from './committees.service';

@Module({
  imports: [AuditLogModule],
  controllers: [CommitteesController],
  providers: [CommitteesService],
})
export class CommitteesModule {}
