import { Module } from '@nestjs/common';
import { KgcetController } from './kgcet.controller';
import { KgcetService } from './kgcet.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [KgcetController],
  providers: [KgcetService],
  exports: [KgcetService],
})
export class KgcetModule {}
