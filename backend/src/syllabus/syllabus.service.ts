import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { AuditLogData } from '../audit-log/audit-log.service';
import { RequestAdmin } from '../homepage/types';
import {
  CreateSyllabusProgrammeDto,
  UpdateSyllabusProgrammeDto,
  CreateSyllabusRegulationDto,
  UpdateSyllabusRegulationDto,
  ReorderSyllabusDto,
} from './dto/syllabus.dto';

const PROGRAMME_MODULE = 'syllabus_programmes';
const REGULATION_MODULE = 'syllabus_regulations';

/**
 * The headings and regulations on Academics -> Syllabus.
 *
 * Programmes and their regulations live in one service because a regulation
 * has no meaning away from its programme - "R23" is R23 *of B.Tech*, and the
 * only way to reach one is through the programme that owns it. Committees and
 * their members are arranged the same way, for the same reason.
 */
@Injectable()
export class SyllabusService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /** Active programmes with their active regulations, in display order. */
  async findAllPublic() {
    return this.prisma.syllabusProgramme.findMany({
      where: { isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        regulations: {
          where: { isActive: true, deletedAt: null },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async findAllAdmin(includeDeleted = false) {
    return this.prisma.syllabusProgramme.findMany({
      where: { ...(!includeDeleted && { deletedAt: null }) },
      orderBy: { sortOrder: 'asc' },
      include: {
        regulations: {
          where: { ...(!includeDeleted && { deletedAt: null }) },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  private async programmeOrThrow(id: number) {
    const record = await this.prisma.syllabusProgramme.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Syllabus programme ${id} not found`);
    }
    return record;
  }

  private async regulationOrThrow(id: number) {
    const record = await this.prisma.syllabusRegulation.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Syllabus regulation ${id} not found`);
    }
    return record;
  }

  private log(
    admin: RequestAdmin,
    action: AuditLogData['action'],
    module: string,
    targetId: number,
    details: Record<string, unknown>,
    requestId?: string,
  ) {
    return this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action,
      module,
      targetId,
      details,
      requestId,
    });
  }

  /* ---------------------------------------------------------------- */
  /* Programmes                                                        */
  /* ---------------------------------------------------------------- */

  /**
   * A new programme goes to the END of the list.
   *
   * Deliberately the opposite of Gallery and Downloads, where the newest
   * upload belongs at the top. These are not uploads: they are the headings
   * of the page, and B.Tech stays above a newly added course until someone
   * says otherwise by dragging it.
   */
  async createProgramme(
    dto: CreateSyllabusProgrammeDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.syllabusProgramme.count({
        where: { deletedAt: null },
      }));

    const created = await this.prisma.syllabusProgramme.create({
      data: { ...dto, sortOrder },
    });

    await this.log(
      admin,
      'CREATE',
      PROGRAMME_MODULE,
      created.id,
      { after: created },
      requestId,
    );
    return created;
  }

  async updateProgramme(
    id: number,
    dto: UpdateSyllabusProgrammeDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.programmeOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Syllabus programme ${id}`);

    const updated = await this.prisma.syllabusProgramme.update({
      where: { id },
      data: { ...rest, version: { increment: 1 } },
    });

    await this.log(
      admin,
      'UPDATE',
      PROGRAMME_MODULE,
      id,
      { before: existing, after: updated, changedFields: Object.keys(rest) },
      requestId,
    );
    return updated;
  }

  async deleteProgramme(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.programmeOrThrow(id);

    // The regulations go with it. They are not reachable on their own, so
    // leaving them live would strand rows nothing can list or restore.
    const [deleted] = await this.prisma.$transaction([
      this.prisma.syllabusProgramme.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: admin.id,
          version: { increment: 1 },
        },
      }),
      this.prisma.syllabusRegulation.updateMany({
        where: { programmeId: id, deletedAt: null },
        data: { deletedAt: new Date(), deletedBy: admin.id },
      }),
    ]);

    await this.log(
      admin,
      'DELETE',
      PROGRAMME_MODULE,
      id,
      { before: existing },
      requestId,
    );
    return deleted;
  }

  async restoreProgramme(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.syllabusProgramme.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted syllabus programme ${id} not found`);
    }

    const [restored] = await this.prisma.$transaction([
      this.prisma.syllabusProgramme.update({
        where: { id },
        data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
      }),
      this.prisma.syllabusRegulation.updateMany({
        where: { programmeId: id, NOT: { deletedAt: null } },
        data: { deletedAt: null, deletedBy: null },
      }),
    ]);

    await this.log(
      admin,
      'RESTORE',
      PROGRAMME_MODULE,
      id,
      { after: restored },
      requestId,
    );
    return restored;
  }

  /* ---------------------------------------------------------------- */
  /* Regulations                                                       */
  /* ---------------------------------------------------------------- */

  /**
   * A new regulation goes to the FRONT of its programme.
   *
   * R26 supersedes R23, which supersedes R20: the newest regulation is the one
   * most students are looking for, and the page has always listed them newest
   * first. Below the lowest number in use rather than renumbering, so any
   * order set by dragging survives.
   */
  private async sortOrderForNewest(programmeId: number): Promise<number> {
    const lowest = await this.prisma.syllabusRegulation.aggregate({
      _min: { sortOrder: true },
      where: { programmeId, deletedAt: null },
    });
    return (lowest._min.sortOrder ?? 0) - 1;
  }

  async createRegulation(
    programmeId: number,
    dto: CreateSyllabusRegulationDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    await this.programmeOrThrow(programmeId);
    const sortOrder =
      dto.sortOrder ?? (await this.sortOrderForNewest(programmeId));

    const created = await this.prisma.syllabusRegulation.create({
      data: { ...dto, programmeId, sortOrder },
    });

    await this.log(
      admin,
      'CREATE',
      REGULATION_MODULE,
      created.id,
      { after: created },
      requestId,
    );
    return created;
  }

  async updateRegulation(
    id: number,
    dto: UpdateSyllabusRegulationDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.regulationOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Syllabus regulation ${id}`);

    const updated = await this.prisma.syllabusRegulation.update({
      where: { id },
      data: { ...rest, version: { increment: 1 } },
    });

    await this.log(
      admin,
      'UPDATE',
      REGULATION_MODULE,
      id,
      { before: existing, after: updated, changedFields: Object.keys(rest) },
      requestId,
    );
    return updated;
  }

  async deleteRegulation(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.regulationOrThrow(id);

    const deleted = await this.prisma.syllabusRegulation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: admin.id,
        version: { increment: 1 },
      },
    });

    await this.log(
      admin,
      'DELETE',
      REGULATION_MODULE,
      id,
      { before: existing },
      requestId,
    );
    return deleted;
  }

  async restoreRegulation(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.syllabusRegulation.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(
        `Deleted syllabus regulation ${id} not found`,
      );
    }

    const restored = await this.prisma.syllabusRegulation.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await this.log(
      admin,
      'RESTORE',
      REGULATION_MODULE,
      id,
      { after: restored },
      requestId,
    );
    return restored;
  }

  /* ---------------------------------------------------------------- */
  /* Reordering                                                        */
  /* ---------------------------------------------------------------- */

  private assertDistinct(dto: ReorderSyllabusDto) {
    const sortOrders = dto.items.map((i) => i.sortOrder);
    if (new Set(sortOrders).size !== sortOrders.length) {
      throw new BadRequestException(
        'Duplicate sortOrder values in reorder payload',
      );
    }
  }

  async reorderProgrammes(
    dto: ReorderSyllabusDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    this.assertDistinct(dto);
    const ids = dto.items.map((i) => i.id);
    const rows = await this.prisma.syllabusProgramme.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true },
    });
    if (rows.length !== ids.length) {
      throw new BadRequestException(
        'One or more syllabus programmes do not exist',
      );
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.syllabusProgramme.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    await this.log(
      admin,
      'REORDER',
      PROGRAMME_MODULE,
      0,
      { after: dto.items },
      requestId,
    );
    return this.findAllAdmin();
  }

  async reorderRegulations(
    programmeId: number,
    dto: ReorderSyllabusDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    this.assertDistinct(dto);
    const ids = dto.items.map((i) => i.id);
    // Scoped to the programme, so a payload cannot reach into another
    // programme's regulations by id.
    const rows = await this.prisma.syllabusRegulation.findMany({
      where: { id: { in: ids }, programmeId, deletedAt: null },
      select: { id: true },
    });
    if (rows.length !== ids.length) {
      throw new BadRequestException(
        'One or more regulations do not belong to this programme',
      );
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.syllabusRegulation.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    await this.log(
      admin,
      'REORDER',
      REGULATION_MODULE,
      programmeId,
      { after: dto.items },
      requestId,
    );
    return this.findAllAdmin();
  }
}
