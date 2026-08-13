import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { SetDisplaySettingDto } from './dto/set-display-setting.dto';
import { BulkSetDisplaySettingsDto } from './dto/bulk-set-display-settings.dto';
import { RequestAdmin } from '../homepage/types';
import { DEPARTMENT_DISPLAY_SETTINGS_CATALOG } from './constants/display-setting-catalog';

const AUDIT_MODULE = 'department_display_settings';

@Injectable()
export class DepartmentDisplaySettingsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  getCatalog() {
    return DEPARTMENT_DISPLAY_SETTINGS_CATALOG;
  }

  // Public consumers (the department page) only need a key -> visible map.
  // Every catalog key defaults to true (visible); a stored row overrides it.
  // Absence of ANY rows for a department therefore means "everything on" -
  // a brand new department needs zero seeded rows.
  async getEffectiveSettings(
    departmentId: number,
  ): Promise<Record<string, boolean>> {
    const rows = await this.prisma.departmentDisplaySetting.findMany({
      where: { departmentId },
    });
    const overrides = new Map(rows.map((r) => [r.key, r.value]));

    const effective: Record<string, boolean> = {};
    for (const entry of DEPARTMENT_DISPLAY_SETTINGS_CATALOG) {
      effective[entry.key] = overrides.get(entry.key) ?? true;
    }
    return effective;
  }

  // Admin view: the full catalog with each entry's effective value and
  // whether it's been explicitly overridden (so the UI can show a "custom"
  // indicator and offer a "reset to default" action later if needed).
  async findAllAdmin(departmentId: number) {
    const rows = await this.prisma.departmentDisplaySetting.findMany({
      where: { departmentId },
    });
    const overrides = new Map(rows.map((r) => [r.key, r.value]));

    return DEPARTMENT_DISPLAY_SETTINGS_CATALOG.map((entry) => ({
      ...entry,
      value: overrides.get(entry.key) ?? true,
      isOverridden: overrides.has(entry.key),
    }));
  }

  async set(
    dto: SetDisplaySettingDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const upserted = await this.prisma.departmentDisplaySetting.upsert({
      where: {
        departmentId_key: { departmentId: dto.departmentId, key: dto.key },
      },
      create: {
        departmentId: dto.departmentId,
        key: dto.key,
        value: dto.value,
        updatedBy: admin.id,
      },
      update: { value: dto.value, updatedBy: admin.id },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: upserted.id,
      details: { after: upserted },
      requestId,
    });

    return upserted;
  }

  async bulkSet(
    dto: BulkSetDisplaySettingsDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    await this.prisma.$transaction(
      dto.settings.map((item) =>
        this.prisma.departmentDisplaySetting.upsert({
          where: {
            departmentId_key: { departmentId: dto.departmentId, key: item.key },
          },
          create: {
            departmentId: dto.departmentId,
            key: item.key,
            value: item.value,
            updatedBy: admin.id,
          },
          update: { value: item.value, updatedBy: admin.id },
        }),
      ),
    );

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: dto.departmentId,
      details: { departmentId: dto.departmentId, settings: dto.settings },
      requestId,
    });

    return this.findAllAdmin(dto.departmentId);
  }
}
