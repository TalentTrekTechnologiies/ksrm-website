import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  CreateKgcetParticipationDto,
  UpdateKgcetParticipationDto,
  CreateKgcetHighlightDto,
  UpdateKgcetHighlightDto,
  ReorderKgcetDto,
} from './dto/kgcet.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'kgcet';
const ORDER = [{ sortOrder: 'asc' as const }, { id: 'asc' as const }];

/**
 * KGCET's own content - the participation figures and the highlight cards.
 *
 * Two near-identical resources, so the CRUD is written once against a Prisma
 * delegate rather than twice. The alternative was two services differing only
 * in the table name, which is how the same soft-delete bug gets fixed in one
 * of them and not the other.
 */
@Injectable()
export class KgcetService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /** Minimal shape both delegates satisfy; keeps the generic CRUD typed. */
  private delegate(resource: 'participation' | 'highlights') {
    return resource === 'participation'
      ? this.prisma.kgcetParticipation
      : this.prisma.kgcetHighlight;
  }

  private label(resource: 'participation' | 'highlights') {
    return resource === 'participation'
      ? 'KGCET participation row'
      : 'KGCET highlight';
  }

  findAllPublic(resource: 'participation' | 'highlights') {
    return (this.delegate(resource) as any).findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: ORDER,
    });
  }

  findAllAdmin(
    resource: 'participation' | 'highlights',
    includeDeleted = false,
  ) {
    return (this.delegate(resource) as any).findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: ORDER,
    });
  }

  private async findActiveOrThrow(
    resource: 'participation' | 'highlights',
    id: number,
  ) {
    const row = await (this.delegate(resource) as any).findFirst({
      where: { id, deletedAt: null },
    });
    if (!row)
      throw new NotFoundException(`${this.label(resource)} ${id} not found`);
    return row;
  }

  async create(
    resource: 'participation' | 'highlights',
    dto: CreateKgcetParticipationDto | CreateKgcetHighlightDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    // A new row goes last unless told otherwise, so adding one never silently
    // reshuffles the published order.
    const sortOrder =
      dto.sortOrder ??
      (await (this.delegate(resource) as any).count({
        where: { deletedAt: null },
      }));

    const created = await (this.delegate(resource) as any).create({
      data: { ...dto, sortOrder },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: AUDIT_MODULE,
      targetId: created.id,
      details: { resource, after: created },
      requestId,
    });

    return created;
  }

  async update(
    resource: 'participation' | 'highlights',
    id: number,
    dto: UpdateKgcetParticipationDto | UpdateKgcetHighlightDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(resource, id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `${this.label(resource)} ${id}`);

    const updated = await (this.delegate(resource) as any).update({
      where: { id },
      data: { ...rest, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: id,
      details: {
        resource,
        before: existing,
        after: updated,
        changedFields: Object.keys(rest),
      },
      requestId,
    });

    return updated;
  }

  async remove(
    resource: 'participation' | 'highlights',
    id: number,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(resource, id);

    const deleted = await (this.delegate(resource) as any).update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: admin.id },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { resource, before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(
    resource: 'participation' | 'highlights',
    id: number,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await (this.delegate(resource) as any).findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`${this.label(resource)} ${id} not found`);

    const restored = await (this.delegate(resource) as any).update({
      where: { id },
      data: { deletedAt: null, deletedBy: null },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { resource, after: restored },
      requestId,
    });

    return restored;
  }

  /**
   * Reorder by listing ids in their new order.
   *
   * Deliberately does NOT bump `version`: dragging a row is not an edit to its
   * content, and bumping it would make everyone else's open form fail its
   * optimistic-lock check for a change they cannot see.
   */
  async reorder(
    resource: 'participation' | 'highlights',
    dto: ReorderKgcetDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    await this.prisma.$transaction(
      dto.ids.map((id, index) =>
        (this.delegate(resource) as any).update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'REORDER',
      module: AUDIT_MODULE,
      details: { resource, ids: dto.ids },
      requestId,
    });

    return this.findAllAdmin(resource);
  }
}
