import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommitteeType, CommitteePlacement, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { CreateCommitteeMemberDto } from './dto/create-committee-member.dto';
import { UpdateCommitteeMemberDto } from './dto/update-committee-member.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';
import { adminScopeWhere } from '../auth/admin-scope.util';

@Injectable()
export class CommitteesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  // Both lists sort the same way, so the admin sees exactly the order the
  // public gets. The id tie-break matters: sortOrder alone left rows that
  // share a value in whatever order Postgres felt like returning, which is
  // how a roster could come back differently on two consecutive requests.
  private static readonly COMMITTEE_ORDER: Prisma.CommitteeOrderByWithRelationInput[] =
    [{ sortOrder: 'asc' }, { name: 'asc' }];
  private static readonly MEMBER_ORDER: Prisma.CommitteeMemberOrderByWithRelationInput[] =
    [{ sortOrder: 'asc' }, { id: 'asc' }];

  async findAllPublic(
    type?: CommitteeType,
    placement?: CommitteePlacement,
    departmentId?: number,
  ) {
    return this.prisma.committee.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(type && { type }),
        ...(placement && { placement }),
        ...(departmentId !== undefined && { departmentId }),
      },
      include: {
        members: {
          where: { isActive: true, deletedAt: null },
          orderBy: CommitteesService.MEMBER_ORDER,
        },
      },
      orderBy: CommitteesService.COMMITTEE_ORDER,
    });
  }

  async findAllAdmin(includeDeleted = false, admin?: RequestAdmin) {
    return this.prisma.committee.findMany({
      where: {
        ...(!includeDeleted && { deletedAt: null }),
        ...adminScopeWhere(admin, { department: true }),
      },
      include: {
        members: {
          where: { deletedAt: null },
          orderBy: CommitteesService.MEMBER_ORDER,
        },
      },
      orderBy: CommitteesService.COMMITTEE_ORDER,
    });
  }

  /**
   * Write a new display order for committees.
   *
   * `ids` is the full list in its new order; position in the array becomes
   * sortOrder. Sending a partial list would renumber those rows from 0 and
   * collide them with rows that were left out, so the whole list is required
   * and verified before anything is written.
   */
  async reorder(ids: number[], admin: RequestAdmin, requestId?: string) {
    await this.assertCompleteOrdering(ids);

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.committee.update({
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
      module: 'committees',
      details: { ids },
      requestId,
    });

    return this.findAllAdmin(true);
  }

  /** Same contract as `reorder`, for the roster inside one committee. */
  async reorderMembers(
    committeeId: number,
    ids: number[],
    admin: RequestAdmin,
    requestId?: string,
  ) {
    await this.findActiveOrThrow(committeeId);
    await this.assertCompleteMemberOrdering(committeeId, ids);

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.committeeMember.update({
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
      module: 'committee_members',
      targetId: committeeId,
      details: { committeeId, ids },
      requestId,
    });

    return this.findAllAdmin(true);
  }

  private async assertCompleteOrdering(ids: number[]) {
    const live = await this.prisma.committee.findMany({
      where: { deletedAt: null },
      select: { id: true },
    });
    this.assertSameSet(
      ids,
      live.map((c) => c.id),
      'committees',
    );
  }

  private async assertCompleteMemberOrdering(
    committeeId: number,
    ids: number[],
  ) {
    const live = await this.prisma.committeeMember.findMany({
      where: { committeeId, deletedAt: null },
      select: { id: true },
    });
    this.assertSameSet(
      ids,
      live.map((m) => m.id),
      'members of this committee',
    );
  }

  private assertSameSet(given: number[], live: number[], label: string) {
    if (new Set(given).size !== given.length) {
      throw new ConflictException(`The same ${label} id was listed twice.`);
    }
    const liveSet = new Set(live);
    const unknown = given.filter((id) => !liveSet.has(id));
    if (unknown.length) {
      throw new NotFoundException(
        `Cannot reorder: ${unknown.join(', ')} no longer exist. Reload and try again.`,
      );
    }
    if (given.length !== live.length) {
      // Someone else added or removed a row since this list was loaded.
      // Renumbering now would drop the missing rows to the top at 0.
      throw new ConflictException(
        `Cannot reorder: the list of ${label} changed while you were dragging. Reload and try again.`,
      );
    }
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.committee.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Committee ${id} not found`);
    }
    return record;
  }

  /**
   * The duplicate check the database can no longer make on its own.
   *
   * The unique index is (type, name, departmentId) so that every department
   * can have a committee called "Board of Studies". Postgres treats each NULL
   * departmentId as distinct, which means the index stopped blocking two
   * identically named institution-wide committees - the guarantee that held
   * before Boards of Studies existed. This restores it, and says which one
   * clashed rather than surfacing a constraint code.
   */
  private async assertNameFree(
    type: CommitteeType,
    name: string,
    departmentId: number | null,
    excludeId?: number,
  ) {
    const clash = await this.prisma.committee.findFirst({
      where: {
        type,
        name,
        departmentId,
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: { id: true, name: true, deletedAt: true },
    });
    if (!clash) return;
    throw new ConflictException(
      clash.deletedAt
        ? `A deleted committee named '${name}' already exists. Restore it from Recently deleted, or use a different name.`
        : `A committee named '${name}' already exists for this type.`,
    );
  }

  async create(
    dto: CreateCommitteeDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    await this.assertNameFree(dto.type, dto.name, dto.departmentId ?? null);

    // A new committee goes to the bottom of the list, not to position 0 where
    // the column default would tie it with whatever already sits there.
    const last = await this.prisma.committee.findFirst({
      where: { deletedAt: null },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    let created;
    try {
      created = await this.prisma.committee.create({
        data: { ...dto, sortOrder: last ? last.sortOrder + 1 : 0 },
      });
    } catch (err) {
      // @@unique([type, name]) counts soft-deleted rows too, so deleting a
      // committee and then creating one with the same name again hit the
      // constraint and surfaced as a bare 500. Say what actually happened,
      // and point at the restore that the admin almost certainly wants -
      // recreating it here would silently resurrect the old membership.
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const deleted = await this.prisma.committee.findFirst({
          where: { type: dto.type, name: dto.name, deletedAt: { not: null } },
        });
        throw new ConflictException(
          deleted
            ? `A deleted committee named '${dto.name}' already exists. Restore it from Recently deleted, or use a different name.`
            : `A committee named '${dto.name}' already exists for this type.`,
        );
      }
      throw err;
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'committees',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdateCommitteeDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Committee ${id}`);

    // Same check as create, against what the row will look like after this
    // edit - moving a committee to another department can collide just as a
    // rename can.
    if (
      rest.name !== undefined ||
      rest.type !== undefined ||
      rest.departmentId !== undefined
    ) {
      await this.assertNameFree(
        rest.type ?? existing.type,
        rest.name ?? existing.name,
        rest.departmentId !== undefined
          ? (rest.departmentId ?? null)
          : existing.departmentId,
        id,
      );
    }

    // Renaming onto a name a deleted committee still holds trips the same
    // constraint as create, so it gets the same explanation rather than a 500.
    let updated;
    try {
      updated = await this.prisma.committee.update({
        where: { id },
        data: { ...rest, version: { increment: 1 } },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `Another committee of this type is already named '${rest.name ?? existing.name}'. It may be in Recently deleted.`,
        );
      }
      throw err;
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'committees',
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

    const deleted = await this.prisma.committee.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: admin.id,
        version: { increment: 1 },
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'committees',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.committee.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted committee ${id} not found`);
    }

    const restored = await this.prisma.committee.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'committees',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  // --- Members ---

  private async findActiveMemberOrThrow(id: number) {
    const record = await this.prisma.committeeMember.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Committee member ${id} not found`);
    }
    return record;
  }

  async createMember(
    committeeId: number,
    dto: CreateCommitteeMemberDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    await this.findActiveOrThrow(committeeId);

    // Land new members at the end of the roster. Left to the column default
    // every one of them arrived at 0, tied with each other, so a new member
    // appeared at an unpredictable place in the list rather than the bottom.
    const last = await this.prisma.committeeMember.findFirst({
      where: { committeeId, deletedAt: null },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });

    const created = await this.prisma.committeeMember.create({
      data: {
        ...dto,
        committeeId,
        sortOrder: dto.sortOrder ?? (last ? last.sortOrder + 1 : 0),
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'committee_members',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async updateMember(
    id: number,
    dto: UpdateCommitteeMemberDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveMemberOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Committee member ${id}`);

    const updated = await this.prisma.committeeMember.update({
      where: { id },
      data: { ...rest, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'committee_members',
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

  async softDeleteMember(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveMemberOrThrow(id);

    const deleted = await this.prisma.committeeMember.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: admin.id,
        version: { increment: 1 },
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'committee_members',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restoreMember(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.committeeMember.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted committee member ${id} not found`);
    }

    const restored = await this.prisma.committeeMember.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'committee_members',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }
}
