import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SiteStatsService, SiteStatsRange } from './site-stats.service';
import { HeartbeatDto } from './dto/heartbeat.dto';

const RANGES: SiteStatsRange[] = ['today', 'yesterday', '7d'];

/**
 * The site's live visitor widget. Fully public, no auth - every visitor's
 * browser tab calls these directly. recordVisit/recordHit/heartbeat are
 * write calls the frontend paces itself (once per session, once per page
 * load, once per ~20s respectively); summary/live are read-only, safe to
 * poll freely.
 */
@ApiTags('site-stats')
@Controller('site-stats')
export class SiteStatsController {
  constructor(private readonly service: SiteStatsService) {}

  @Post('visit')
  recordVisit() {
    return this.service.recordVisit();
  }

  @Post('hit')
  recordHit() {
    return this.service.recordHit();
  }

  @Post('heartbeat')
  heartbeat(@Body() dto: HeartbeatDto) {
    return this.service.heartbeat(dto.id);
  }

  @Get('summary')
  getSummary(@Query('range') range?: string) {
    const resolved = RANGES.includes(range as SiteStatsRange) ? (range as SiteStatsRange) : 'today';
    return this.service.getSummary(resolved);
  }

  @Get('live')
  getLive() {
    return this.service.getLive();
  }
}
