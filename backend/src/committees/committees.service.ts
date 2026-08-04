import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CommitteeType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { CreateCommitteeMemberDto } from './dto/create-committee-member.dto';
import { UpdateCommitteeMemberDto } from './dto/update-committee-member.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

@Injectable()
export class CommitteesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAllPublic(type?: CommitteeType) {
    return this.prisma.committee.findMany({
      where: { isActive: true, deletedAt: null, ...(type && { type }) },
      include: {
        members: { where: { isActive: true, deletedAt: null }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findAllAdmin(includeDeleted = false) {
    return this.prisma.committee.findMany({
      where: { ...(!includeDeleted && { deletedAt: null }) },
      include: { members: { where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { name: 'asc' },
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.committee.findFirst({ where: { id, deletedAt: null } });
    if (!record) {
      throw new NotFoundException(`Committee ${id} not found`);
    }
    return record;
  }

  async create(dto: CreateCommitteeDto, admin: RequestAdmin, requestId?: string) {
    let created;
    try {
      created = await this.prisma.committee.create({ data: dto });
    } catch (err) {
      // @@unique([type, name]) counts soft-deleted rows too, so deleting a
      // committee and then creating one with the same name again hit the
      // constraint and surfaced as a bare 500. Say what actually happened,
      // and point at the restore that the admin almost certainly wants -
      // recreating it here would silently resurrect the old membership.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
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

  async update(id: number, dto: UpdateCommitteeDto, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Committee ${id}`);

    // Renaming onto a name a deleted committee still holds trips the same
    // constraint as create, so it gets the same explanation rather than a 500.
    let updated;
    try {
      updated = await this.prisma.committee.update({
        where: { id },
        data: { ...rest, version: { increment: 1 } },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
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
      details: { before: existing, after: updated, changedFields: Object.keys(rest) },
      requestId,
    });

    return updated;
  }

  async softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.committee.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: admin.id, version: { increment: 1 } },
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
    const existing = await this.prisma.committee.findFirst({ where: { id, NOT: { deletedAt: null } } });
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
    const record = await this.prisma.committeeMember.findFirst({ where: { id, deletedAt: null } });
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

    const created = await this.prisma.committeeMember.create({
      data: { ...dto, committeeId },
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
      details: { before: existing, after: updated, changedFields: Object.keys(rest) },
      requestId,
    });

    return updated;
  }

  async softDeleteMember(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveMemberOrThrow(id);

    const deleted = await this.prisma.committeeMember.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: admin.id, version: { increment: 1 } },
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
    const existing = await this.prisma.committeeMember.findFirst({ where: { id, NOT: { deletedAt: null } } });
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
