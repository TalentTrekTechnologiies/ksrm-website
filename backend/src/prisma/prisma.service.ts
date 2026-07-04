import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

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
