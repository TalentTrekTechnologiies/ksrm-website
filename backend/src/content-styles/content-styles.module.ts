import { Module } from '@nestjs/common';
import { ContentStylesController } from './content-styles.controller';
import { ContentStylesService } from './content-styles.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [ContentStylesController],
  providers: [ContentStylesService],
  exports: [ContentStylesService],
})
export class ContentStylesModule {}
