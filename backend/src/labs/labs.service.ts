import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateLabDto } from './dto/create-lab.dto';
import { UpdateLabDto } from './dto/update-lab.dto';
import { ReorderLabsDto } from './dto/reorder-labs.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';
import { MediaLinkService } from '../media/media-link.service';

const MEDIA_MODULE = 'labs';
const MEDIA_FIELD = 'imageUrl';

@Injectable()
export class LabsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaLink: MediaLinkService,
  ) {}

  async findAllPublic(departmentId: number) {
    return this.prisma.lab.findMany({
      where: { departmentId, isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findAllAdmin(departmentId?: number, includeDeleted = false) {
    return this.prisma.lab.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(!includeDeleted && { deletedAt: null }),
      },
      orderBy: [{ departmentId: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.lab.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Lab ${id} not found`);
    }
    return record;
  }

  async create(dto: CreateLabDto, admin: RequestAdmin, requestId?: string) {
    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.lab.count({
        where: { departmentId: dto.departmentId, deletedAt: null },
      }));

    const resolvedUrl = await this.mediaLink.prepareLink(dto.mediaId, 'IMAGE');

    const created = await this.prisma.lab.create({
      data: { ...dto, imageUrl: resolvedUrl ?? dto.imageUrl, sortOrder },
    });

    await this.mediaLink.syncUsage(
      MEDIA_MODULE,
      created.id,
      MEDIA_FIELD,
      dto.mediaId,
    );

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: MEDIA_MODULE,
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdateLabDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Lab ${id}`);

    const resolvedUrl = await this.mediaLink.prepareLink(rest.mediaId, 'IMAGE');

    const updated = await this.prisma.lab.update({
      where: { id },
      data: {
        ...rest,
        ...(resolvedUrl !== undefined && { imageUrl: resolvedUrl }),
        version: { increment: 1 },
      },
    });

    await this.mediaLink.syncUsage(MEDIA_MODULE, id, MEDIA_FIELD, rest.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: MEDIA_MODULE,
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

    const deleted = await this.prisma.lab.update({
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
      module: MEDIA_MODULE,
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.lab.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted lab ${id} not found`);
    }

    const restored = await this.prisma.lab.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    if (restored.mediaId) {
      await this.mediaLink.syncUsage(
        MEDIA_MODULE,
        id,
        MEDIA_FIELD,
        restored.mediaId,
      );
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: MEDIA_MODULE,
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  async reorder(dto: ReorderLabsDto, admin: RequestAdmin, requestId?: string) {
    const sortOrders = dto.items.map((i) => i.sortOrder);
    if (new Set(sortOrders).size !== sortOrders.length) {
      throw new BadRequestException(
        'Duplicate sortOrder values in reorder payload',
      );
    }

    const ids = dto.items.map((i) => i.id);
    const existingRows = await this.prisma.lab.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException('One or more labs do not exist');
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.lab.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'REORDER',
      module: MEDIA_MODULE,
      details: { items: dto.items },
      requestId,
    });

    return this.findAllAdmin();
  }
}
