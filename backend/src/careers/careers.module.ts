import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CareersController } from './careers.controller';
import { CareersService } from './careers.service';

@Module({
  imports: [AuditLogModule],
  controllers: [CareersController],
  providers: [CareersService],
})
export class CareersModule {}
