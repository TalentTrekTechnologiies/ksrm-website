import { Module } from '@nestjs/common';
import { FacultyAchievementsService } from './faculty-achievements.service';
import { FacultyAchievementsController } from './faculty-achievements.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  controllers: [FacultyAchievementsController],
  providers: [FacultyAchievementsService],
  exports: [FacultyAchievementsService],
})
export class FacultyAchievementsModule {}
