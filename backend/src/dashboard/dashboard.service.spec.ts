import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { EffectivePermissionsService } from '../auth/effective-permissions.service';
import { MediaStatsService } from '../media/media-stats.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: {
    [key: string]: { count: jest.Mock } | { findMany: jest.Mock } | jest.Mock;
    auditLog: { findMany: jest.Mock };
  };
  let effectivePermissions: {
    getEffectivePermissions: jest.Mock;
  };
  let mediaStats: { getStats: jest.Mock };

  const countingModels = [
    'faculty',
    'department',
    'departmentProgramme',
    'transportRoute',
    'news',
    'galleryImage',
    'placement',
    'examNotification',
    'notification',
    'research',
    'download',
    'committee',
    'pageBanner',
    'siteStatistic',
    'testimonial',
    'campusVideo',
    'accreditationBadge',
    'recruiter',
    'faq',
    'leadershipProfile',
    'contentCard',
    'contactChannel',
    'siteSetting',
    'admin',
    'role',
    'media',
  ];

  beforeEach(async () => {
    prisma = { auditLog: { findMany: jest.fn().mockResolvedValue([]) } };
    for (const model of countingModels) {
      prisma[model] = { count: jest.fn().mockResolvedValue(0) };
    }

    effectivePermissions = {
      getEffectivePermissions: jest.fn().mockResolvedValue(new Set()),
    };
    mediaStats = {
      getStats: jest.fn().mockResolvedValue({
        counts: { IMAGE: 0, VIDEO: 0, DOCUMENT: 0 },
        totalSizeBytes: '0',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: EffectivePermissionsService, useValue: effectivePermissions },
        { provide: MediaStatsService, useValue: mediaStats },
      ],
    }).compile();

    service = module.get(DashboardService);
  });

  describe('getOverview', () => {
    it('includes every widget for a super admin, regardless of permissions', async () => {
      const result = await service.getOverview({ id: 1, isSuperAdmin: true });
      // 22 since KGCET got a screen of its own - the sidebar filters on
      // widget keys, so a module without one is built and invisible.
      expect(result.widgets.length).toBe(22);
      expect(result.widgets.map((w) => w.key)).toContain('kgcet');
      expect(result.widgets.map((w) => w.key)).toContain('admins');
      expect(result.widgets.map((w) => w.key)).toContain('roles');
      expect(result.widgets.map((w) => w.key)).toContain('careers');
      expect(result.widgets.map((w) => w.key)).toContain('events');
      expect(result.widgets.map((w) => w.key)).toContain('career_applications');
      expect(result.widgets.map((w) => w.key)).toContain('announcements');
      // Programmes drive the college-wide Academics and admissions pages, so
      // they get their own widget and sidebar entry, not just a department tab.
      expect(result.widgets.map((w) => w.key)).toContain('department_programmes');
    });

    it('only includes widgets the admin has <key>.view permission for', async () => {
      effectivePermissions.getEffectivePermissions.mockResolvedValue(
        new Set(['faculty.view', 'news.view']),
      );

      const result = await service.getOverview({ id: 2, isSuperAdmin: false });

      expect(result.widgets.map((w) => w.key).sort()).toEqual([
        'faculty',
        'news',
      ]);
    });

    it('returns no widgets when the admin has no view permissions at all', async () => {
      effectivePermissions.getEffectivePermissions.mockResolvedValue(
        new Set(),
      );

      const result = await service.getOverview({ id: 3, isSuperAdmin: false });

      expect(result.widgets).toEqual([]);
    });

    it('sums all 9 page-driven content tables into the single page_content widget', async () => {
      (prisma.pageBanner as { count: jest.Mock }).count.mockResolvedValue(2);
      (prisma.testimonial as { count: jest.Mock }).count.mockResolvedValue(3);
      (prisma.faq as { count: jest.Mock }).count.mockResolvedValue(5);

      const result = await service.getOverview({ id: 1, isSuperAdmin: true });

      const pageContentWidget = result.widgets.find(
        (w) => w.key === 'page_content',
      );
      expect(pageContentWidget?.count).toBe(10);
      expect(pageContentWidget?.available).toBe(true);
    });

    it('degrades a single failing widget to available:false/count:0 instead of failing the whole request', async () => {
      (prisma.department as { count: jest.Mock }).count.mockRejectedValue(
        new Error('relation "Department" does not exist'),
      );

      const result = await service.getOverview({ id: 1, isSuperAdmin: true });

      const departmentsWidget = result.widgets.find(
        (w) => w.key === 'departments',
      );
      expect(departmentsWidget?.available).toBe(false);
      expect(departmentsWidget?.count).toBe(0);

      // every other widget is unaffected
      const facultyWidget = result.widgets.find((w) => w.key === 'faculty');
      expect(facultyWidget?.available).toBe(true);
    });
  });

  describe('getRecentActivity', () => {
    it('filters AuditLog by the modules the admin can view, for a non-super-admin', async () => {
      effectivePermissions.getEffectivePermissions.mockResolvedValue(
        new Set(['placements.view']),
      );

      await service.getRecentActivity({ id: 4, isSuperAdmin: false });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { module: { in: ['placements'] } },
        }),
      );
    });

    it('does not filter by module at all for a super admin', async () => {
      await service.getRecentActivity({ id: 1, isSuperAdmin: true });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: undefined }),
      );
    });

    it('returns an empty list instead of throwing if the query fails', async () => {
      prisma.auditLog.findMany.mockRejectedValue(new Error('db down'));

      const result = await service.getRecentActivity({
        id: 1,
        isSuperAdmin: true,
      });

      expect(result.items).toEqual([]);
    });
  });

  describe('getPendingApprovals', () => {
    it('always returns an empty, honestly-labeled result', () => {
      const result = service.getPendingApprovals();
      expect(result.items).toEqual([]);
      expect(result.count).toBe(0);
      expect(result.note).toMatch(/no approval workflow/i);
    });
  });

  describe('getStorage', () => {
    it('reports real Media Library usage, with an honestly-zeroed quota', async () => {
      mediaStats.getStats.mockResolvedValue({
        counts: { IMAGE: 5, VIDEO: 1, DOCUMENT: 2 },
        totalSizeBytes: '18874368',
      });

      const result = await service.getStorage();

      expect(result.usedBytes).toBe(18874368);
      expect(result.totalBytes).toBe(0);
      expect(result.breakdown).toEqual([
        { type: 'IMAGE', count: 5 },
        { type: 'VIDEO', count: 1 },
        { type: 'DOCUMENT', count: 2 },
      ]);
      expect(result.note).toMatch(/media library/i);
    });
  });
});
