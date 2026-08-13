import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';

describe('EventsService', () => {
  let service: EventsService;
  let prisma: {
    event: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };
  let mediaLink: {
    prepareLink: jest.Mock;
    syncUsage: jest.Mock;
    untrackAll: jest.Mock;
  };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      event: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };
    mediaLink = {
      prepareLink: jest
        .fn()
        .mockImplementation((mediaId: number | null | undefined) =>
          mediaId === undefined || mediaId === null
            ? Promise.resolve(undefined)
            : Promise.resolve(
                'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
              ),
        ),
      syncUsage: jest.fn().mockResolvedValue(undefined),
      untrackAll: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
      ],
    }).compile();

    service = module.get(EventsService);
  });

  describe('findAllPublic', () => {
    it('only returns active, non-deleted rows ordered by upcoming eventDate', async () => {
      prisma.event.findMany.mockResolvedValue([]);

      await service.findAllPublic();

      expect(prisma.event.findMany).toHaveBeenCalledWith({
        where: { isActive: true, deletedAt: null },
        orderBy: { eventDate: 'asc' },
      });
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.event.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and untracks Media usage', async () => {
      prisma.event.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.event.update.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
        deletedBy: 1,
      });

      await service.softDelete(1, admin, undefined);

      expect(prisma.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          deletedAt: expect.any(Date),
          deletedBy: 1,
          version: { increment: 1 },
        },
      });
      expect(mediaLink.untrackAll).toHaveBeenCalledWith('events', 1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'events' }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.event.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('re-tracks Media usage on restore when the row still has a mediaId', async () => {
      prisma.event.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      prisma.event.update.mockResolvedValue({
        id: 1,
        deletedAt: null,
        mediaId: 9,
      });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'events',
        1,
        'imageUrl',
        9,
      );
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'RESTORE' }),
      );
    });

    it('does not re-track on restore when the row has no mediaId', async () => {
      prisma.event.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      prisma.event.update.mockResolvedValue({
        id: 1,
        deletedAt: null,
        mediaId: null,
      });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).not.toHaveBeenCalled();
    });
  });

  describe('date conversion', () => {
    it('create() converts eventDate/endDate strings to Date instances before hitting Prisma', async () => {
      prisma.event.count.mockResolvedValue(0);
      prisma.event.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          title: 'Annual Day',
          eventDate: '2026-08-01',
          endDate: '2026-08-02',
        },
        admin,
        undefined,
      );

      const data = prisma.event.create.mock.calls[0][0].data;
      expect(data.eventDate).toBeInstanceOf(Date);
      expect(data.endDate).toBeInstanceOf(Date);
    });

    it('update() converts eventDate only when provided', async () => {
      prisma.event.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.event.update.mockResolvedValue({ id: 1, version: 2 });

      await service.update(
        1,
        { eventDate: '2026-09-01', version: 1 },
        admin,
        undefined,
      );

      const data = prisma.event.update.mock.calls[0][0].data;
      expect(data.eventDate).toBeInstanceOf(Date);
      expect(data.endDate).toBeUndefined();
    });
  });

  describe('Media Library linking', () => {
    it('on create, resolves imageUrl from mediaId and tracks usage', async () => {
      prisma.event.count.mockResolvedValue(0);
      prisma.event.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          title: 'Annual Day',
          eventDate: '2026-08-01',
          imageUrl: '/fallback.jpg',
          mediaId: 9,
        },
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'IMAGE');
      expect(prisma.event.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          imageUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
        }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'events',
        5,
        'imageUrl',
        9,
      );
    });

    it('on update with mediaId: null, unlinks without touching imageUrl', async () => {
      prisma.event.findFirst.mockResolvedValue({
        id: 1,
        version: 1,
        imageUrl: '/existing.jpg',
      });
      prisma.event.update.mockResolvedValue({ id: 1, version: 2 });

      await service.update(1, { mediaId: null, version: 1 }, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'events',
        1,
        'imageUrl',
        null,
      );
      expect(prisma.event.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ imageUrl: expect.anything() }),
        }),
      );
    });
  });

  describe('reorder', () => {
    it('rejects duplicate sortOrder values before touching the database', async () => {
      await expect(
        service.reorder(
          {
            items: [
              { id: 1, sortOrder: 0 },
              { id: 2, sortOrder: 0 },
            ],
          },
          admin,
          undefined,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('reorders in a single transaction and logs REORDER', async () => {
      prisma.event.findMany
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
        .mockResolvedValueOnce([{ id: 2 }, { id: 1 }]);
      prisma.$transaction.mockResolvedValue(undefined);

      await service.reorder(
        {
          items: [
            { id: 1, sortOrder: 1 },
            { id: 2, sortOrder: 0 },
          ],
        },
        admin,
        'req-3',
      );

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REORDER', requestId: 'req-3' }),
      );
    });

    // Reorder takes an arbitrary id list, which no ownership guard can cover -
    // they authorize one target per request. Checked in the service instead.
    const payload = {
      items: [
        { id: 1, sortOrder: 0 },
        { id: 2, sortOrder: 1 },
      ],
    };
    const deptAdmin = { ...admin, isSuperAdmin: false, departmentId: 5 };

    it('lets a department admin reorder events that are all their own', async () => {
      prisma.event.findMany
        .mockResolvedValueOnce([
          { id: 1, departmentId: 5 },
          { id: 2, departmentId: 5 },
        ])
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      prisma.$transaction.mockResolvedValue(undefined);

      await expect(
        service.reorder(payload, deptAdmin, undefined),
      ).resolves.toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("403s a department admin reordering another department's events", async () => {
      prisma.event.findMany.mockResolvedValueOnce([
        { id: 1, departmentId: 5 },
        { id: 2, departmentId: 6 },
      ]);
      await expect(
        service.reorder(payload, deptAdmin, undefined),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('403s a department admin reordering unowned/global events', async () => {
      prisma.event.findMany.mockResolvedValueOnce([
        { id: 1, departmentId: null },
        { id: 2, departmentId: null },
      ]);
      await expect(
        service.reorder(payload, deptAdmin, undefined),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('never restricts a super admin', async () => {
      prisma.event.findMany
        .mockResolvedValueOnce([
          { id: 1, departmentId: 6 },
          { id: 2, departmentId: null },
        ])
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      prisma.$transaction.mockResolvedValue(undefined);

      await expect(
        service.reorder(
          payload,
          { ...admin, isSuperAdmin: true, departmentId: 5 },
          undefined,
        ),
      ).resolves.toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });
});
