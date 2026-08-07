import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SiteStatsService } from './site-stats.service';

/**
 * The footer's live visitor counter. Fully public, no auth - every visitor
 * hits GET on load and POST once per browser session (frontend guards the
 * repeat with sessionStorage so a page's own polling refresh never inflates
 * the count).
 */
@ApiTags('site-stats')
@Controller('site-stats')
export class SiteStatsController {
  constructor(private readonly service: SiteStatsService) {}

  @Get('visit')
  getStats() {
    return this.service.getStats();
  }

  @Post('visit')
  recordVisit() {
    return this.service.recordVisit();
  }
}
