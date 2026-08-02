import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { bumpContentVersion } from '../content-version/content-version.state';

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
      if (WRITE_ACTIONS.has(params.action)) {
        // After `next` resolves, so a failed write never signals a change.
        // AuditLog itself is excluded: logging a change would otherwise count
        // as a change and the version would never settle.
        if (params.model !== 'AuditLog') bumpContentVersion();
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
