import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OutcomeType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateLearningOutcomeDto } from './dto/create-learning-outcome.dto';
import { UpdateLearningOutcomeDto } from './dto/update-learning-outcome.dto';
import { ReorderLearningOutcomesDto } from './dto/reorder-learning-outcomes.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'learning_outcomes';

@Injectable()
export class LearningOutcomesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAllPublic(departmentId: number, type?: OutcomeType) {
    return this.prisma.learningOutcome.findMany({
      where: { departmentId, deletedAt: null, ...(type && { type }) },
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  async findAllAdmin(departmentId?: number, includeDeleted = false) {
    return this.prisma.learningOutcome.findMany({
      where: {
        ...(departmentId && { departmentId }),
        ...(!includeDeleted && { deletedAt: null }),
      },
      orderBy: [{ departmentId: 'asc' }, { type: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.learningOutcome.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Learning outcome ${id} not found`);
    }
    return record;
  }

  /**
   * Frees a code held only by deleted records.
   *
   * The unique key (department, type, code) covers deleted rows too, so once
   * "PSO1" was deleted no new "PSO1" could be saved - the admin got "already
   * exists" for a record they could not see, and on Mechanical's page that
   * ended with whole sentences typed into Code to get past it. The deleted
   * record keeps everything; only its code moves aside, to
   * "PSO1 (deleted #12)", which also says what it was if it is restored.
   */
  private async releaseCodeFromDeleted(
    departmentId: number,
    type: OutcomeType,
    code: string,
    exceptId?: number,
  ) {
    const holders = await this.prisma.learningOutcome.findMany({
      where: {
        departmentId,
        type,
        code,
        NOT: { deletedAt: null },
        ...(exceptId !== undefined && { id: { not: exceptId } }),
      },
      select: { id: true },
    });
    for (const h of holders) {
      await this.prisma.learningOutcome.update({
        where: { id: h.id },
        data: { code: `${code} (deleted #${h.id})`, version: { increment: 1 } },
      });
    }
  }

  async create(
    dto: CreateLearningOutcomeDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    await this.releaseCodeFromDeleted(dto.departmentId, dto.type, dto.code);

    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.learningOutcome.count({
        where: {
          departmentId: dto.departmentId,
          type: dto.type,
          deletedAt: null,
        },
      }));

    let created;
    try {
      created = await this.prisma.learningOutcome.create({
        data: { ...dto, sortOrder },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `${dto.code} already exists for this department - edit that one instead of adding another.`,
        );
      }
      throw err;
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: AUDIT_MODULE,
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdateLearningOutcomeDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Learning outcome ${id}`);
    if (rest.code !== undefined && rest.code !== existing.code) {
      await this.releaseCodeFromDeleted(
        existing.departmentId,
        existing.type,
        rest.code,
        id,
      );
    }

    let updated;
    try {
      updated = await this.prisma.learningOutcome.update({
        where: { id },
        data: { ...rest, version: { increment: 1 } },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new ConflictException(
          `${rest.code} already exists for this department - another ${existing.type} uses that code.`,
        );
      }
      throw err;
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
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

    const deleted = await this.prisma.learningOutcome.update({
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
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.learningOutcome.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted learning outcome ${id} not found`);
    }

    const restored = await this.prisma.learningOutcome.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  async reorder(
    dto: ReorderLearningOutcomesDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const sortOrders = dto.items.map((i) => i.sortOrder);
    if (new Set(sortOrders).size !== sortOrders.length) {
      throw new BadRequestException(
        'Duplicate sortOrder values in reorder payload',
      );
    }

    const ids = dto.items.map((i) => i.id);
    const existingRows = await this.prisma.learningOutcome.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException(
        'One or more learning outcomes do not exist',
      );
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.learningOutcome.update({
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
      module: AUDIT_MODULE,
      details: { items: dto.items },
      requestId,
    });

    return this.findAllAdmin();
  }
}
