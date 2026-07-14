import { Injectable } from '@nestjs/common';
import { MediaType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface MediaStats {
  counts: Record<MediaType, number>;
  totalSizeBytes: string;
}

@Injectable()
export class MediaStatsService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<MediaStats> {
    const grouped = await this.prisma.media.groupBy({
      by: ['type'],
      where: { deletedAt: null },
      _count: { _all: true },
      _sum: { sizeBytes: true },
    });

    const counts: Record<MediaType, number> = {
      IMAGE: 0,
      VIDEO: 0,
      DOCUMENT: 0,
    };
    let totalSizeBytes = BigInt(0);

    for (const row of grouped) {
      counts[row.type] = row._count._all;
      totalSizeBytes += row._sum.sizeBytes ?? BigInt(0);
    }

    return { counts, totalSizeBytes: totalSizeBytes.toString() };
  }
}
