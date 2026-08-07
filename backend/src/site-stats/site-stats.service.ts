import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type SiteStatsRange = 'today' | 'yesterday' | '7d';

const LIVE_WINDOW_MS = 90_000;
const PRESENCE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

/** Midnight of a given day (default today), in the server's local timezone -
 *  matches the `@db.Date` column, which stores a calendar date with no time
 *  component. */
function dateOnly(offsetDays = 0): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + offsetDays);
}

@Injectable()
export class SiteStatsService {
  constructor(private prisma: PrismaService) {}

  private async upsertToday(field: 'count' | 'hits') {
    const today = dateOnly();
    const row = await this.prisma.siteVisitDay.upsert({
      where: { date: today },
      create: { date: today, [field]: 1 },
      update: { [field]: { increment: 1 } },
    });
    return { visits: row.count, hits: row.hits };
  }

  /** Called once per browser tab session. */
  async recordVisit() {
    return this.upsertToday('count');
  }

  /** Called on every page load/navigation. */
  async recordHit() {
    return this.upsertToday('hits');
  }

  async getSummary(range: SiteStatsRange) {
    if (range === '7d') {
      const from = dateOnly(-6);
      const { _sum } = await this.prisma.siteVisitDay.aggregate({
        where: { date: { gte: from } },
        _sum: { count: true, hits: true },
      });
      return { visits: _sum.count ?? 0, hits: _sum.hits ?? 0 };
    }
    const date = range === 'yesterday' ? dateOnly(-1) : dateOnly();
    const row = await this.prisma.siteVisitDay.findUnique({ where: { date } });
    return { visits: row?.count ?? 0, hits: row?.hits ?? 0 };
  }

  /** Upserts this tab's presence row and, opportunistically, prunes rows
   *  stale enough that they can never count as "live" again - cheaper than a
   *  scheduled cleanup job for a table this small. */
  async heartbeat(id: string) {
    await this.prisma.sitePresence.upsert({
      where: { id },
      create: { id },
      update: { lastSeenAt: new Date() },
    });
    await this.prisma.sitePresence.deleteMany({
      where: { lastSeenAt: { lt: new Date(Date.now() - PRESENCE_MAX_AGE_MS) } },
    });
    return this.getLive();
  }

  async getLive() {
    const live = await this.prisma.sitePresence.count({
      where: { lastSeenAt: { gte: new Date(Date.now() - LIVE_WINDOW_MS) } },
    });
    return { live };
  }
}
