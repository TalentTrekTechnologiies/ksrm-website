import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { bumpContentVersion } from '../content-version/content-version.state';

/**
 * Writes that are not content, and so must not tell the site to reload.
 *
 * This list existed as a single `!== 'AuditLog'` check, and the two visitor
 * tracking tables were missed - which made every page load and every open tab
 * announce a content change to every visitor on the site:
 *
 *   - SiteVisitDay is written on each page load (visit and hit counters)
 *   - SitePresence is upserted by every open tab, every sixty seconds
 *
 * The public site polls the content version every two seconds and refetches
 * everything the moment it moves. So with any traffic at all, every visitor
 * was refetching all forty-odd endpoints every couple of seconds, for the rest
 * of their visit - and the busier the site got, the worse it became. Measured
 * on the live homepage: 72 content requests in fourteen seconds, almost all of
 * them repeats exactly 2.1 seconds apart, which is the poll interval.
 *
 * AuditLog was always here for a related reason: logging a change is itself a
 * write, so it would count as a change and the version would never settle.
 * AdminNotification is admin-only and never appears on the public site.
 */
const NON_CONTENT_MODELS = new Set([
  'AuditLog',
  'SiteVisitDay',
  'SitePresence',
  'AdminNotification',
]);

/** Prisma actions that change data. Reads are ignored. */
const WRITE_ACTIONS = new Set([
  'create',
  'createMany',
  'update',
  'updateMany',
  'upsert',
  'delete',
  'deleteMany',
  'executeRaw',
]);

/**
 * Should this write tell every visitor to reload the site's content?
 *
 * Exported and pure so the rule can be tested directly. It is one line of
 * behaviour that, when wrong, makes the whole site feel broken without
 * anything failing - see NON_CONTENT_MODELS above.
 */
export function announcesContentChange(
  action: string,
  model: string | undefined,
): boolean {
  if (!WRITE_ACTIONS.has(action)) return false;
  return !NON_CONTENT_MODELS.has(model ?? '');
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super();
    // Announce every write, so the public site can notice an edit within
    // seconds instead of waiting out a polling interval.
    //
    // Hooked at the Prisma layer rather than in AuditLogService on purpose:
    // auditing is per-module and can be missed when a new module is added,
    // whereas nothing reaches the database without passing through here. A
    // write that somehow skipped its audit entry would still show up on the
    // site, which is the behaviour that matters to an editor.
    this.$use(async (params, next) => {
      const result = await next(params);
      // After `next` resolves, so a failed write never signals a change.
      if (announcesContentChange(params.action, params.model)) {
        bumpContentVersion();
      }
      return result;
    });
  }

  async onModuleInit() {
    // Don't let a transient/unavailable database at boot time take the
    // whole HTTP server down with it - Prisma connects lazily on the first
    // real query anyway, so a failed eager connect here just means the API
    // starts in a degraded state instead of not starting at all. This is
    // what makes GET /health's "database" field meaningful: without this,
    // health could never be reached at all while the database is down.
    try {
      await this.$connect();
      this.logger.log('Prisma connected');
    } catch (error) {
      this.logger.error(
        'Failed to connect to the database at startup - starting anyway. ' +
          'Database-backed routes will fail until connectivity is restored.',
        error instanceof Error ? error.message : error,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
