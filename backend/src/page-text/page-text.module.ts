import { Module } from '@nestjs/common';
import { PageTextService } from './page-text.service';
import { PageTextController } from './page-text.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [PageTextController],
  providers: [PageTextService],
  exports: [PageTextService],
})
export class PageTextModule {}
