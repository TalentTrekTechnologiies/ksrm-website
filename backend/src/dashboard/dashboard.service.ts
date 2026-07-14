import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  EffectivePermissionsService,
  PermissionSubjectAdmin,
} from '../auth/effective-permissions.service';
import { DashboardOverviewResponseDto } from './dto/dashboard-overview.dto';
import { RecentActivityResponseDto } from './dto/recent-activity.dto';
import { PendingApprovalsResponseDto } from './dto/pending-approvals.dto';
import { StorageResponseDto } from './dto/storage.dto';
import { MediaStatsService } from '../media/media-stats.service';

interface WidgetDefinition {
  key: string;
  label: string;
  /** `<key>.view` is assumed for every widget below - see isWidgetVisible. */
  count: (prisma: PrismaService) => Promise<number>;
}

/**
 * One widget per RBAC module (see prisma/seed.ts's MODULE_ACTIONS) so that
 * "does this admin see this widget" is always exactly "does this admin
 * have `<key>.view`" - no separate visibility rules to keep in sync.
 *
 * `page_content` bundles the 9 page-driven content tables added in Phase
 * 1B into one widget, matching how that single permission module covers
 * all of them.
 */
const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  { key: 'faculty', label: 'Faculty', count: (p) => p.faculty.count() },
  {
    key: 'departments',
    label: 'Departments',
    count: (p) => p.department.count(),
  },
  { key: 'news', label: 'News Posts', count: (p) => p.news.count() },
  {
    key: 'gallery',
    label: 'Gallery Images',
    count: (p) => p.galleryImage.count(),
  },
  {
    key: 'placements',
    label: 'Placement Records',
    count: (p) => p.placement.count(),
  },
  {
    key: 'exam_notifications',
    label: 'Exam Notifications',
    count: (p) => p.examNotification.count(),
  },
  {
    key: 'research',
    label: 'Research Records',
    count: (p) => p.research.count(),
  },
  { key: 'downloads', label: 'Downloads', count: (p) => p.download.count() },
  {
    key: 'committees',
    label: 'Committees',
    count: (p) => p.committee.count(),
  },
  {
    key: 'page_content',
    label: 'Page Content Items',
    count: async (p) => {
      const counts = await Promise.all([
        p.pageBanner.count(),
        p.siteStatistic.count(),
        p.testimonial.count(),
        p.campusVideo.count(),
        p.accreditationBadge.count(),
        p.recruiter.count(),
        p.faq.count(),
        p.leadershipProfile.count(),
        p.contentCard.count(),
      ]);
      return counts.reduce((sum, n) => sum + n, 0);
    },
  },
  {
    key: 'contact',
    label: 'Contact Channels',
    count: (p) => p.contactChannel.count(),
  },
  {
    key: 'site_settings',
    label: 'Site Settings',
    count: (p) => p.siteSetting.count(),
  },
  { key: 'admins', label: 'Admin Accounts', count: (p) => p.admin.count() },
  { key: 'roles', label: 'Roles', count: (p) => p.role.count() },
  {
    key: 'career_applications',
    label: 'Job Applications',
    count: (p) => p.careerApplication.count(),
  },
  { key: 'careers', label: 'Job Openings', count: (p) => p.career.count() },
  { key: 'events', label: 'Events', count: (p) => p.event.count() },
  {
    key: 'announcements',
    label: 'Announcements',
    count: (p) => p.announcement.count({ where: { deletedAt: null } }),
  },
  {
    key: 'media',
    label: 'Media Library',
    count: (p) => p.media.count({ where: { deletedAt: null } }),
  },
];

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly effectivePermissions: EffectivePermissionsService,
    private readonly mediaStats: MediaStatsService,
  ) {}

  /**
   * Runs a widget's count query, but never lets it take the rest of the
   * dashboard down with it. This matters concretely in this project's
   * current state: several tables this dashboard queries (Department,
   * Category, the Phase 1B content tables, etc.) exist in schema.prisma
   * and the generated Prisma Client, but their migrations have never been
   * applied to any real database in this environment - querying them
   * against a real, un-migrated Postgres would throw "relation does not
   * exist", and querying them with no database configured at all throws
   * a connection error. Either way, one missing/not-yet-migrated table
   * should degrade that one widget to `available: false, count: 0`, not
   * 500 the whole dashboard.
   */
  private async safeCount(
    fn: (prisma: PrismaService) => Promise<number>,
    widgetKey: string,
  ): Promise<{ count: number; available: boolean }> {
    try {
      const count = await fn(this.prisma);
      return { count, available: true };
    } catch (error) {
      this.logger.warn(
        `Dashboard widget "${widgetKey}" count failed - reporting 0/unavailable instead of failing the request.`,
        error instanceof Error ? error.message : error,
      );
      return { count: 0, available: false };
    }
  }

  async getOverview(
    admin: PermissionSubjectAdmin,
  ): Promise<DashboardOverviewResponseDto> {
    const permissions =
      await this.effectivePermissions.getEffectivePermissions(admin);
    const canSeeAll = admin.isSuperAdmin;

    const visibleWidgets = WIDGET_DEFINITIONS.filter(
      (widget) => canSeeAll || permissions.has(`${widget.key}.view`),
    );

    const widgets = await Promise.all(
      visibleWidgets.map(async (widget) => {
        const { count, available } = await this.safeCount(
          widget.count,
          widget.key,
        );
        return {
          key: widget.key,
          label: widget.label,
          count,
          available,
        };
      }),
    );

    return {
      widgets,
      generatedAt: new Date().toISOString(),
    };
  }

  async getRecentActivity(
    admin: PermissionSubjectAdmin,
    limit = 20,
  ): Promise<RecentActivityResponseDto> {
    const permissions =
      await this.effectivePermissions.getEffectivePermissions(admin);

    // AuditLog.module is free-text (see DATA_MODEL_DESIGN.md §3.18) and
    // isn't itself gated by a dedicated "audit_log" permission - instead,
    // an admin sees activity only for modules they can already view,
    // consistent with the rest of this dashboard being permission-aware
    // per-widget rather than all-or-nothing.
    const visibleModules = admin.isSuperAdmin
      ? undefined
      : WIDGET_DEFINITIONS.filter((w) => permissions.has(`${w.key}.view`)).map(
          (w) => w.key,
        );

    try {
      const logs = await this.prisma.auditLog.findMany({
        where: visibleModules ? { module: { in: visibleModules } } : undefined,
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return {
        items: logs.map((log) => ({
          id: log.id,
          module: log.module,
          action: log.action,
          targetId: log.targetId,
          adminName: log.adminName,
          createdAt: log.createdAt.toISOString(),
        })),
      };
    } catch (error) {
      this.logger.warn(
        'Dashboard recent-activity query failed - reporting an empty list instead of failing the request.',
        error instanceof Error ? error.message : error,
      );
      return { items: [] };
    }
  }

  /**
   * Always empty: no draft/review/approval workflow exists anywhere in the
   * current data model (no entity has a pending/approved/rejected status).
   * See DATA_MODEL_DESIGN.md - this is a deliberate placeholder, not a bug.
   */
  getPendingApprovals(): PendingApprovalsResponseDto {
    return {
      items: [],
      count: 0,
      note: 'No approval workflow exists in the data model yet - see DATA_MODEL_DESIGN.md.',
    };
  }

  /**
   * Reports real usage from the Media Library (the first and only file
   * upload/storage subsystem in this backend - added after the original
   * project handoff audit that this method's note used to reference, see
   * PROJECT_HANDOFF.md §9). `totalBytes` stays 0 - there's no configured
   * storage quota/capacity concept anywhere, which is a separate,
   * still-unbuilt feature from "does a storage subsystem exist at all".
   */
  async getStorage(): Promise<StorageResponseDto> {
    const stats = await this.mediaStats.getStats();
    return {
      usedBytes: Number(stats.totalSizeBytes),
      totalBytes: 0,
      breakdown: (Object.keys(stats.counts) as (keyof typeof stats.counts)[]).map((type) => ({
        type,
        count: stats.counts[type],
      })),
      note: 'Reflects the Media Library. totalBytes is 0 - no storage quota/capacity is configured anywhere yet.',
    };
  }
}
