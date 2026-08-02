import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UpsertPageTextDto } from './dto/upsert-page-text.dto';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'page_text';

/**
 * Admin overrides for the wording on public pages.
 *
 * A page's own text lives in the frontend registry and is what the static
 * export ships; a row here replaces one slot of it at runtime. That means the
 * absence of a row is a valid, meaningful state - "this page still says what it
 * has always said" - which shapes the whole module:
 *
 *  - no isActive and no soft-delete; deleting an override *is* the undo
 *  - upsert rather than create/update, because the admin edits a slot, not a row
 *  - save takes the whole page at once, so one Save in the UI is one request
 */
@Injectable()
export class PageTextService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /** Every override for a page. Public - this is published site content. */
  findAllPublic(pageSection?: string) {
    return this.prisma.pageText.findMany({
      where: { ...(pageSection && { pageSection }) },
      orderBy: { key: 'asc' },
    });
  }

  findAllAdmin(pageSection?: string) {
    return this.findAllPublic(pageSection);
  }

  /**
   * Saves a page's edits. Each item either creates or updates the override for
   * its slot; slots the admin left at their default are simply absent from
   * `items` and keep having no row.
   */
  async upsert(dto: UpsertPageTextDto, admin: RequestAdmin, requestId?: string) {
    const saved: Awaited<ReturnType<typeof this.prisma.pageText.upsert>>[] = [];

    for (const item of dto.items) {
      const before = await this.prisma.pageText.findUnique({
        where: { key: item.key },
      });

      // Nothing changed - don't bump the version or write an audit entry for a
      // no-op, or every Save would look like an edit to all of them.
      if (before && before.value === item.value) {
        saved.push(before);
        continue;
      }

      const row = await this.prisma.pageText.upsert({
        where: { key: item.key },
        create: {
          key: item.key,
          pageSection: item.pageSection,
          value: item.value,
        },
        update: {
          value: item.value,
          pageSection: item.pageSection,
          version: { increment: 1 },
        },
      });

      await this.auditLog.log({
        adminId: admin.id,
        adminName: admin.name,
        adminEmail: admin.email,
        action: before ? 'UPDATE' : 'CREATE',
        module: AUDIT_MODULE,
        targetId: row.id,
        // `title` names the slot in the audit log; pageSection resolves to the
        // page name there, so an entry reads as "edited Library page".
        details: {
          title: item.key,
          pageSection: item.pageSection,
          ...(before ? { before: { value: before.value } } : {}),
          after: { value: row.value },
        },
        requestId,
      });

      saved.push(row);
    }

    return saved;
  }

  /**
   * Drops an override so the page falls back to its built-in wording. Silent
   * when there is nothing to remove - the admin's intent ("this slot should be
   * the default") is already satisfied, and a 404 would be noise.
   */
  async reset(key: string, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.pageText.findUnique({ where: { key } });
    if (!existing) return { key, reset: false };

    await this.prisma.pageText.delete({ where: { key } });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: AUDIT_MODULE,
      targetId: existing.id,
      details: {
        title: key,
        pageSection: existing.pageSection,
        before: { value: existing.value },
      },
      requestId,
    });

    return { key, reset: true };
  }
}
