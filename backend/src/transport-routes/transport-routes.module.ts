import { Module } from '@nestjs/common';
import { TransportRoutesController } from './transport-routes.controller';
import { TransportRoutesService } from './transport-routes.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [TransportRoutesController],
  providers: [TransportRoutesService],
  exports: [TransportRoutesService],
})
export class TransportRoutesModule {}
