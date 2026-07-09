import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateSiteSettingDto } from './dto/create-site-setting.dto';
import { UpdateSiteSettingDto } from './dto/update-site-setting.dto';
import { RequestAdmin } from '../homepage/types';

@Injectable()
export class SiteSettingsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async findAll(group?: string) {
    return this.prisma.siteSetting.findMany({
      where: { ...(group && { group }) },
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  }

  private async findOrThrow(id: number) {
    const record = await this.prisma.siteSetting.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Site setting ${id} not found`);
    }
    return record;
  }

  async create(dto: CreateSiteSettingDto, admin: RequestAdmin, requestId?: string) {
    let created;
    try {
      created = await this.prisma.siteSetting.create({
        data: { ...dto, updatedBy: admin.id },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new BadRequestException(`Setting key '${dto.key}' already exists`);
      }
      throw err;
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'site_settings',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(id: number, dto: UpdateSiteSettingDto, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findOrThrow(id);

    let updated;
    try {
      updated = await this.prisma.siteSetting.update({
        where: { id },
        data: { ...dto, updatedBy: admin.id },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new BadRequestException(`Setting key '${dto.key}' already exists`);
      }
      throw err;
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'site_settings',
      targetId: id,
      details: { before: existing, after: updated, changedFields: Object.keys(dto) },
      requestId,
    });

    return updated;
  }

  async delete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findOrThrow(id);

    // Real delete, not soft-delete - SiteSetting has no deletedAt/version
    // columns by design (system config, not content).
    const deleted = await this.prisma.siteSetting.delete({ where: { id } });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'site_settings',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }
}
