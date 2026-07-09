import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { RequestAdmin } from '../types';
import {
  SECTION_VISIBILITY_KEYS,
  SectionVisibilityKey,
  settingKeyFor,
} from './section-visibility.constants';

const GROUP = 'homepage_visibility';
const AUDIT_MODULE = 'homepage_section_visibility';

export interface SectionVisibility {
  key: SectionVisibilityKey;
  visible: boolean;
}

export interface VisibilityWrapped<T> {
  visible: boolean;
  items: T[];
}

/**
 * Backed by the pre-existing, previously-unused `SiteSetting` table rather
 * than a new one - one boolean row per section key, `group:
 * 'homepage_visibility'`. Public list endpoints call `wrap()` so a hidden
 * section returns `{ visible: false, items: [] }` instead of just an empty
 * array - the frontend needs to tell "admin turned this off" apart from
 * "temporarily empty" so it can actually hide the section rather than
 * falling back to stale hardcoded content.
 */
@Injectable()
export class SectionVisibilityService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async getAll(): Promise<SectionVisibility[]> {
    const rows = await this.prisma.siteSetting.findMany({
      where: { group: GROUP },
    });
    const byKey = new Map(rows.map((r) => [r.key, r.value === 'true']));

    return SECTION_VISIBILITY_KEYS.map((key) => ({
      key,
      // Defaults to visible if the row is somehow missing - a section
      // should never silently disappear because a setting row wasn't seeded.
      visible: byKey.get(settingKeyFor(key)) ?? true,
    }));
  }

  async isVisible(key: SectionVisibilityKey): Promise<boolean> {
    const row = await this.prisma.siteSetting.findUnique({
      where: { key: settingKeyFor(key) },
    });
    return row ? row.value === 'true' : true;
  }

  async wrap<T>(
    key: SectionVisibilityKey,
    items: T[],
  ): Promise<VisibilityWrapped<T>> {
    const visible = await this.isVisible(key);
    return { visible, items: visible ? items : [] };
  }

  async update(
    key: SectionVisibilityKey,
    visible: boolean,
    admin: RequestAdmin,
    requestId?: string,
  ): Promise<SectionVisibility> {
    const settingKey = settingKeyFor(key);
    const before = await this.prisma.siteSetting.findUnique({
      where: { key: settingKey },
    });

    await this.prisma.siteSetting.upsert({
      where: { key: settingKey },
      update: { value: String(visible), updatedBy: admin.id },
      create: {
        key: settingKey,
        value: String(visible),
        type: 'BOOLEAN',
        group: GROUP,
        isPublic: true,
        updatedBy: admin.id,
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      details: {
        before: { visible: before ? before.value === 'true' : true },
        after: { visible },
        section: key,
      },
      requestId,
    });

    return { key, visible };
  }
}
