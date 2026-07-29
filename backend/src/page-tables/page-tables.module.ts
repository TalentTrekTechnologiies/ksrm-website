import { Module } from '@nestjs/common';
import { PageTablesService } from './page-tables.service';
import { PageTablesController } from './page-tables.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [PageTablesController],
  providers: [PageTablesService],
  exports: [PageTablesService],
})
export class PageTablesModule {}
