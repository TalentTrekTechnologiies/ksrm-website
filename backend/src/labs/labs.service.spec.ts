import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { LabsService } from './labs.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';

describe('LabsService', () => {
  let service: LabsService;
  let prisma: {
    lab: {
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
      lab: {
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
        LabsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
      ],
    }).compile();

    service = module.get(LabsService);
  });

  describe('findAllPublic', () => {
    it('scopes to one department, active + non-deleted only', async () => {
      prisma.lab.findMany.mockResolvedValue([]);

      await service.findAllPublic(3);

      expect(prisma.lab.findMany).toHaveBeenCalledWith({
        where: { departmentId: 3, isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('findAllAdmin', () => {
    it('filters by departmentId when provided', async () => {
      prisma.lab.findMany.mockResolvedValue([]);

      await service.findAllAdmin(3);

      expect(prisma.lab.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ departmentId: 3 }),
        }),
      );
    });

    it('lists across all departments when no departmentId given', async () => {
      prisma.lab.findMany.mockResolvedValue([]);

      await service.findAllAdmin();

      expect(prisma.lab.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { deletedAt: null } }),
      );
    });
  });

  describe('create', () => {
    it('auto-assigns sortOrder scoped to the department', async () => {
      prisma.lab.count.mockResolvedValue(2);
      prisma.lab.create.mockResolvedValue({ id: 5, sortOrder: 2 });

      await service.create(
        { departmentId: 3, name: 'AI Lab', description: 'desc' },
        admin,
        undefined,
      );

      expect(prisma.lab.count).toHaveBeenCalledWith({
        where: { departmentId: 3, deletedAt: null },
      });
      expect(prisma.lab.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ sortOrder: 2 }),
      });
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.lab.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.lab.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and untracks Media usage', async () => {
      prisma.lab.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.lab.update.mockResolvedValue({ id: 1, deletedAt: new Date() });

      await service.softDelete(1, admin, undefined);

      expect(mediaLink.untrackAll).toHaveBeenCalledWith('labs', 1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'labs' }),
      );
    });

    it('re-tracks Media usage on restore when the row still has a mediaId', async () => {
      prisma.lab.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.lab.update.mockResolvedValue({
        id: 1,
        deletedAt: null,
        mediaId: 9,
      });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'labs',
        1,
        'imageUrl',
        9,
      );
    });
  });

  describe('Media Library linking', () => {
    it('on create, resolves imageUrl from mediaId and tracks usage', async () => {
      prisma.lab.count.mockResolvedValue(0);
      prisma.lab.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          departmentId: 3,
          name: 'AI Lab',
          description: 'desc',
          imageUrl: '/fallback.jpg',
          mediaId: 9,
        },
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'IMAGE');
      expect(prisma.lab.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          imageUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
        }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'labs',
        5,
        'imageUrl',
        9,
      );
    });

    it('on update with mediaId: null, unlinks without touching imageUrl', async () => {
      prisma.lab.findFirst.mockResolvedValue({
        id: 1,
        version: 1,
        imageUrl: '/existing.jpg',
      });
      prisma.lab.update.mockResolvedValue({ id: 1, version: 2 });

      await service.update(1, { mediaId: null, version: 1 }, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'labs',
        1,
        'imageUrl',
        null,
      );
      expect(prisma.lab.update).toHaveBeenCalledWith(
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
      prisma.lab.findMany
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
  });
});
