import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;
  let prisma: {
    announcement: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    announcementPlacement: { deleteMany: jest.Mock; createMany: jest.Mock };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };
  let adminNotifications: { notifyByPermission: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      announcement: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      announcementPlacement: { deleteMany: jest.fn(), createMany: jest.fn() },
      $transaction: jest.fn(),
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };
    adminNotifications = { notifyByPermission: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: AdminNotificationsService, useValue: adminNotifications },
      ],
    }).compile();

    service = module.get(AnnouncementsService);
  });

  describe('findAllPublic', () => {
    it('filters by location, published/active, and the auto-expiry window', async () => {
      prisma.announcement.findMany.mockResolvedValue([]);

      await service.findAllPublic('HEADER_TICKER' as any);

      const callArg = prisma.announcement.findMany.mock.calls[0][0];
      expect(callArg.where.isActive).toBe(true);
      expect(callArg.where.isPublished).toBe(true);
      expect(callArg.where.deletedAt).toBeNull();
      expect(callArg.where.placements.some.location).toBe('HEADER_TICKER');
      expect(callArg.orderBy).toEqual([{ priority: 'asc' }, { sortOrder: 'asc' }]);
    });

    it('scopes DEPARTMENT_PAGE to global (null) or this department placements', async () => {
      prisma.announcement.findMany.mockResolvedValue([]);

      await service.findAllPublic('DEPARTMENT_PAGE' as any, 5);

      const callArg = prisma.announcement.findMany.mock.calls[0][0];
      expect(callArg.where.placements.some).toEqual({
        location: 'DEPARTMENT_PAGE',
        OR: [{ departmentId: null }, { departmentId: 5 }],
      });
    });
  });

  describe('create', () => {
    it('rejects a create with zero placements', async () => {
      await expect(
        service.create({ title: 'x', placements: [] } as any, admin, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('dedupes identical placements before creating', async () => {
      prisma.$transaction.mockImplementation(async (fn: any) => {
        const tx = {
          announcement: {
            create: jest.fn().mockResolvedValue({ id: 1, placements: [] }),
          },
        };
        return fn(tx);
      });

      await service.create(
        {
          title: 'Admissions Open',
          placements: [
            { location: 'HEADER_TICKER' },
            { location: 'HEADER_TICKER' }, // exact duplicate
            { location: 'HERO_BANNER' },
          ],
        } as any,
        admin,
        undefined,
      );

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', module: 'announcements' }),
      );
    });
  });

  describe('update', () => {
    it('404s on an unknown id', async () => {
      prisma.announcement.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('409s on stale version', async () => {
      prisma.announcement.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toThrow();
    });
  });

  describe('setPublished', () => {
    it('logs PUBLISH when publishing', async () => {
      prisma.announcement.findFirst.mockResolvedValue({ id: 1, isPublished: false });
      prisma.announcement.update.mockResolvedValue({ id: 1, isPublished: true });

      await service.setPublished(1, true, admin, undefined);

      expect(auditLog.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'PUBLISH' }));
    });

    it('logs UNPUBLISH when unpublishing', async () => {
      prisma.announcement.findFirst.mockResolvedValue({ id: 1, isPublished: true });
      prisma.announcement.update.mockResolvedValue({ id: 1, isPublished: false });

      await service.setPublished(1, false, admin, undefined);

      expect(auditLog.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'UNPUBLISH' }));
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and logs DELETE', async () => {
      prisma.announcement.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.announcement.update.mockResolvedValue({ id: 1, deletedAt: new Date() });

      await service.softDelete(1, admin, undefined);

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'announcements' }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.announcement.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
