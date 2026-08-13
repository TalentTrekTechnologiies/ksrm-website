import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { adminScopeWhere } from '../auth/admin-scope.util';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreatePageTableDto } from './dto/create-page-table.dto';
import { UpdatePageTableDto } from './dto/update-page-table.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'page_tables';

/**
 * Editable tables of page text (fee structures, courses & intake, ...). Rows
 * are stored as Json; every row is normalised to a string array matching the
 * column count so a page can render them without defensive checks.
 */
@Injectable()
export class PageTablesService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /** Rows must be an array of arrays; each row is padded/trimmed to `columns`. */
  private normaliseRows(rows: unknown, columnCount: number): string[][] {
    if (!Array.isArray(rows)) {
      throw new BadRequestException('rows must be an array of arrays');
    }
    return rows.map((row) => {
      if (!Array.isArray(row)) {
        throw new BadRequestException(
          'each row must be an array of cell values',
        );
      }
      const cells = row.map((c) =>
        c === null || c === undefined ? '' : String(c),
      );
      cells.length = columnCount;
      return Array.from(cells, (c) => c ?? '');
    });
  }

  findAllPublic(pageSection?: string) {
    return this.prisma.pageTable.findMany({
      where: { isActive: true, ...(pageSection && { pageSection }) },
      orderBy: [{ pageSection: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  findAllAdmin(pageSection?: string, admin?: RequestAdmin) {
    return this.prisma.pageTable.findMany({
      where: {
        ...(pageSection && { pageSection }),
        // Scope from the caller - a page-owning admin lists only their pages.
        ...adminScopeWhere(admin, { page: true }),
      },
      orderBy: [{ pageSection: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  private async findOrThrow(id: number) {
    const row = await this.prisma.pageTable.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Page table ${id} not found`);
    return row;
  }

  async create(
    dto: CreatePageTableDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const rows = this.normaliseRows(dto.rows, dto.columns.length);
    try {
      const created = await this.prisma.pageTable.create({
        data: { ...dto, rows: rows },
      });
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
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new BadRequestException(
          `A table with the key "${dto.key}" already exists.`,
        );
      }
      throw err;
    }
  }

  async update(
    id: number,
    dto: UpdatePageTableDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findOrThrow(id);
    const { version, rows, columns, ...rest } = dto;
    assertVersionMatch(existing, version, `Page table ${id}`);

    const nextColumns = columns ?? existing.columns;
    const data: Prisma.PageTableUpdateInput = {
      ...rest,
      ...(columns && { columns }),
      version: { increment: 1 },
    };
    if (rows !== undefined) {
      data.rows = this.normaliseRows(rows, nextColumns.length);
    } else if (columns) {
      // Column count changed - reshape the stored rows to match.
      data.rows = this.normaliseRows(existing.rows, nextColumns.length);
    }

    const updated = await this.prisma.pageTable.update({ where: { id }, data });
    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing, after: updated },
      requestId,
    });
    return updated;
  }

  async remove(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findOrThrow(id);
    const deleted = await this.prisma.pageTable.delete({ where: { id } });
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
}
