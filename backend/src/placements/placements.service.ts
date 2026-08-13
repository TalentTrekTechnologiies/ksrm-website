import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';
import { MediaLinkService } from '../media/media-link.service';

const MEDIA_MODULE = 'placements';

@Injectable()
export class PlacementsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaLink: MediaLinkService,
  ) {}

  async findAll(year?: number) {
    const where = year
      ? { year, isPublished: true, deletedAt: null }
      : { isPublished: true, deletedAt: null };
    return this.prisma.placement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(includeDeleted = false) {
    return this.prisma.placement.findMany({
      where: { ...(!includeDeleted && { deletedAt: null }) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats() {
    const placements = await this.prisma.placement.findMany({
      where: { deletedAt: null },
    });
    const uniqueCompanies = new Set(placements.map((p) => p.company)).size;

    return {
      totalPlacements: placements.length,
      uniqueCompanies,
      byDepartment: placements.reduce(
        (acc, p) => {
          acc[p.department] = (acc[p.department] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
      byYear: placements.reduce(
        (acc, p) => {
          acc[p.year] = (acc[p.year] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>,
      ),
    };
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.placement.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Placement ${id} not found`);
    }
    return record;
  }

  async create(
    dto: CreatePlacementDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const [resolvedImageUrl, resolvedLogoUrl] = await Promise.all([
      this.mediaLink.prepareLink(dto.mediaId, 'IMAGE'),
      this.mediaLink.prepareLink(dto.companyLogoMediaId, 'IMAGE'),
    ]);

    const created = await this.prisma.placement.create({
      data: {
        ...dto,
        imageUrl: resolvedImageUrl ?? dto.imageUrl,
        companyLogoUrl: resolvedLogoUrl ?? dto.companyLogoUrl,
      },
    });

    await Promise.all([
      this.mediaLink.syncUsage(
        MEDIA_MODULE,
        created.id,
        'imageUrl',
        dto.mediaId,
      ),
      this.mediaLink.syncUsage(
        MEDIA_MODULE,
        created.id,
        'companyLogoUrl',
        dto.companyLogoMediaId,
      ),
    ]);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'placements',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdatePlacementDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Placement ${id}`);

    const [resolvedImageUrl, resolvedLogoUrl] = await Promise.all([
      this.mediaLink.prepareLink(rest.mediaId, 'IMAGE'),
      this.mediaLink.prepareLink(rest.companyLogoMediaId, 'IMAGE'),
    ]);

    const updated = await this.prisma.placement.update({
      where: { id },
      data: {
        ...rest,
        ...(resolvedImageUrl !== undefined && { imageUrl: resolvedImageUrl }),
        ...(resolvedLogoUrl !== undefined && {
          companyLogoUrl: resolvedLogoUrl,
        }),
        version: { increment: 1 },
      },
    });

    await Promise.all([
      this.mediaLink.syncUsage(MEDIA_MODULE, id, 'imageUrl', rest.mediaId),
      this.mediaLink.syncUsage(
        MEDIA_MODULE,
        id,
        'companyLogoUrl',
        rest.companyLogoMediaId,
      ),
    ]);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'placements',
      targetId: id,
      details: {
        before: existing,
        after: updated,
        changedFields: Object.keys(rest),
      },
      requestId,
    });

    return updated;
  }

  async softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.placement.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: admin.id,
        version: { increment: 1 },
      },
    });

    await this.mediaLink.untrackAll(MEDIA_MODULE, id);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'placements',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.placement.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted placement ${id} not found`);
    }

    const restored = await this.prisma.placement.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await Promise.all([
      restored.mediaId
        ? this.mediaLink.syncUsage(
            MEDIA_MODULE,
            id,
            'imageUrl',
            restored.mediaId,
          )
        : Promise.resolve(),
      restored.companyLogoMediaId
        ? this.mediaLink.syncUsage(
            MEDIA_MODULE,
            id,
            'companyLogoUrl',
            restored.companyLogoMediaId,
          )
        : Promise.resolve(),
    ]);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'placements',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }
}
