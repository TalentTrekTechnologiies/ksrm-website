import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** Midnight of today, in the server's local timezone - matches the `@db.Date`
 *  column, which stores a calendar date with no time component. */
function todayDateOnly(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

@Injectable()
export class SiteStatsService {
  constructor(private prisma: PrismaService) {}

  private async totalAndToday() {
    const today = todayDateOnly();
    const [{ _sum }, todayRow] = await Promise.all([
      this.prisma.siteVisitDay.aggregate({ _sum: { count: true } }),
      this.prisma.siteVisitDay.findUnique({ where: { date: today } }),
    ]);
    return { total: _sum.count ?? 0, today: todayRow?.count ?? 0 };
  }

  /** Called once per browser session by the public site. Upserts today's row
   *  rather than always creating, so a busy day is one row, not thousands. */
  async recordVisit() {
    const today = todayDateOnly();
    await this.prisma.siteVisitDay.upsert({
      where: { date: today },
      create: { date: today, count: 1 },
      update: { count: { increment: 1 } },
    });
    return this.totalAndToday();
  }

  /** Read-only - used for the counter's periodic "live" refresh, which must
   *  not itself count as another visit. */
  async getStats() {
    return this.totalAndToday();
  }
}
