import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { APP_VERSION } from './version';

export interface HealthStatus {
  status: 'ok' | 'degraded';
  uptime: number;
  timestamp: string;
  version: string;
  database: 'connected' | 'disconnected';
}

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  async getHealth(): Promise<HealthStatus> {
    const databaseConnected = await this.prisma.isConnected();

    return {
      status: databaseConnected ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: APP_VERSION,
      database: databaseConnected ? 'connected' : 'disconnected',
    };
  }
}
