import { Module } from '@nestjs/common';
import { SiteStatsController } from './site-stats.controller';
import { SiteStatsService } from './site-stats.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SiteStatsController],
  providers: [SiteStatsService],
})
export class SiteStatsModule {}
