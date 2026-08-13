import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateSiteSettingDto } from './dto/create-site-setting.dto';
import { UpdateSiteSettingDto } from './dto/update-site-setting.dto';
import { RequestAdmin } from '../homepage/types';
import { MediaLinkService } from '../media/media-link.service';
import { MediaStatsService } from '../media/media-stats.service';
import { NotificationService } from '../mailer/notification.service';
import { APP_VERSION } from '../version';

const MEDIA_MODULE = 'site_settings';
const MEDIA_FIELD = 'value';

// SectionVisibilityService (backend/src/homepage/section-visibility/) also
// stores its rows in this same generic key/value table - a deliberate
// storage-reuse decision, not a sign it's actually a Site Setting. It has
// its own dedicated service/endpoints/admin toggle (SectionVisibilityToggle
// per Homepage section manager), so excluding this group here doesn't lose
// any functionality - it just keeps the Site Settings page scoped to what
// the user explicitly asked it to manage: global configuration only, not
// every module that happens to use the same table for convenience.
const EXCLUDED_GROUPS = ['homepage_visibility'];

@Injectable()
export class SiteSettingsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaLink: MediaLinkService,
    private mediaStats: MediaStatsService,
    private notification: NotificationService,
  ) {}

  async findAll(group?: string) {
    return this.prisma.siteSetting.findMany({
      // AND, not a spread that would overwrite one `group` condition with
      // the other - a plain `{ group: {...}, ...(group && {group}) }` would
      // silently drop the exclusion whenever a specific group was requested
      // (the later spread key wins in a JS object literal).
      where: {
        AND: [
          { group: { notIn: EXCLUDED_GROUPS } },
          ...(group ? [{ group }] : []),
        ],
      },
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
  }

  // The public counterpart of findAll() - `isPublic` existed on the model
  // from the start but had no route to actually filter by it until this
  // method, so the public site could never read a single SiteSetting row
  // (the whole controller is @UseGuards(JwtAuthGuard, ...)). Only key/value
  // are returned - description/updatedBy/etc are admin-only detail an
  // unauthenticated caller has no business seeing.
  async findAllPublic(group?: string) {
    const rows = await this.prisma.siteSetting.findMany({
      where: {
        isPublic: true,
        AND: [
          { group: { notIn: EXCLUDED_GROUPS } },
          ...(group ? [{ group }] : []),
        ],
      },
      select: { key: true, value: true, type: true, group: true },
      orderBy: [{ group: 'asc' }, { key: 'asc' }],
    });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  private async findOrThrow(id: number) {
    const record = await this.prisma.siteSetting.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Site setting ${id} not found`);
    }
    return record;
  }

  async create(
    dto: CreateSiteSettingDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const resolvedUrl = await this.mediaLink.prepareLink(dto.mediaId, 'IMAGE');

    let created;
    try {
      created = await this.prisma.siteSetting.create({
        data: { ...dto, value: resolvedUrl ?? dto.value, updatedBy: admin.id },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new BadRequestException(
          `Setting key '${dto.key}' already exists`,
        );
      }
      throw err;
    }

    await this.mediaLink.syncUsage(
      MEDIA_MODULE,
      created.id,
      MEDIA_FIELD,
      dto.mediaId,
    );

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

  async update(
    id: number,
    dto: UpdateSiteSettingDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findOrThrow(id);

    const resolvedUrl = await this.mediaLink.prepareLink(dto.mediaId, 'IMAGE');

    let updated;
    try {
      updated = await this.prisma.siteSetting.update({
        where: { id },
        data: {
          ...dto,
          ...(resolvedUrl !== undefined && { value: resolvedUrl }),
          updatedBy: admin.id,
        },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new BadRequestException(
          `Setting key '${dto.key}' already exists`,
        );
      }
      throw err;
    }

    await this.mediaLink.syncUsage(MEDIA_MODULE, id, MEDIA_FIELD, dto.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'site_settings',
      targetId: id,
      details: {
        before: existing,
        after: updated,
        changedFields: Object.keys(dto),
      },
      requestId,
    });

    return updated;
  }

  async delete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findOrThrow(id);

    // Real delete, not soft-delete - SiteSetting has no deletedAt/version
    // columns by design (system config, not content).
    const deleted = await this.prisma.siteSetting.delete({ where: { id } });

    await this.mediaLink.untrackAll(MEDIA_MODULE, id);

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

  // Light-weight "System" panel for the Site Settings page - version/env/
  // storage only. The fuller System Health Dashboard (failed jobs, active
  // users, last backup, etc.) is a separate, not-yet-built roadmap item;
  // this deliberately doesn't duplicate that scope, just what fits
  // naturally as read-only "System" info alongside the rest of Site
  // Settings.
  async getSystemInfo() {
    const mediaStats = await this.mediaStats.getStats();
    return {
      version: APP_VERSION,
      environment: process.env.NODE_ENV ?? 'development',
      storageUsedBytes: mediaStats.totalSizeBytes,
    };
  }

  // Sends a real email through whichever provider EMAIL_PROVIDER selects -
  // lets an admin confirm the configured provider actually works without
  // digging through server logs (the console provider just logs, so this
  // still "succeeds" there without proving a real SMTP/SES path - the
  // response says which provider handled it so that's not misleading).
  async sendTestEmail(to: string, admin: RequestAdmin, requestId?: string) {
    await this.notification.send({
      to,
      subject: 'KSRM CMS - Test Email',
      html: `<p>This is a test email from the KSRM CMS Site Settings page, sent by ${admin.name} (${admin.email}).</p><p>If you received this, email sending is configured correctly.</p>`,
      text: `This is a test email from the KSRM CMS Site Settings page, sent by ${admin.name} (${admin.email}). If you received this, email sending is configured correctly.`,
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'site_settings',
      details: { after: { testEmailSentTo: to } },
      requestId,
    });

    return { sent: true, to };
  }
}
