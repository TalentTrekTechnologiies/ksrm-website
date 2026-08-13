import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DepartmentHighlightsService } from './department-highlights.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';

describe('DepartmentHighlightsService', () => {
  let service: DepartmentHighlightsService;
  let prisma: {
    departmentHighlight: {
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
      departmentHighlight: {
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
        DepartmentHighlightsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
      ],
    }).compile();

    service = module.get(DepartmentHighlightsService);
  });

  describe('findAllPublic', () => {
    it('scopes to one department and filters by kind when provided (e.g. only Achievements)', async () => {
      prisma.departmentHighlight.findMany.mockResolvedValue([]);

      await service.findAllPublic(3, 'ACHIEVEMENT');

      expect(prisma.departmentHighlight.findMany).toHaveBeenCalledWith({
        where: {
          departmentId: 3,
          isActive: true,
          deletedAt: null,
          kind: 'ACHIEVEMENT',
        },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('auto-assigns sortOrder scoped to department+kind independently', async () => {
      prisma.departmentHighlight.count.mockResolvedValue(1);
      prisma.departmentHighlight.create.mockResolvedValue({
        id: 5,
        sortOrder: 1,
      });

      await service.create(
        {
          departmentId: 3,
          kind: 'HIGHLIGHT',
          title: 'AI Lab',
          description: 'desc',
        } as any,
        admin,
        undefined,
      );

      expect(prisma.departmentHighlight.count).toHaveBeenCalledWith({
        where: { departmentId: 3, kind: 'HIGHLIGHT', deletedAt: null },
      });
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and untracks Media usage', async () => {
      prisma.departmentHighlight.findFirst.mockResolvedValue({
        id: 1,
        version: 1,
      });
      prisma.departmentHighlight.update.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });

      await service.softDelete(1, admin, undefined);

      expect(mediaLink.untrackAll).toHaveBeenCalledWith(
        'department_highlights',
        1,
      );
    });

    it('re-tracks Media usage on restore when the row still has a mediaId', async () => {
      prisma.departmentHighlight.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      prisma.departmentHighlight.update.mockResolvedValue({
        id: 1,
        deletedAt: null,
        mediaId: 9,
      });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'department_highlights',
        1,
        'imageUrl',
        9,
      );
    });
  });

  describe('Media Library linking', () => {
    it('on create, resolves imageUrl from mediaId and tracks usage', async () => {
      prisma.departmentHighlight.count.mockResolvedValue(0);
      prisma.departmentHighlight.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          departmentId: 3,
          kind: 'ACHIEVEMENT',
          title: 'NAAC A+',
          description: 'desc',
          imageUrl: '/fallback.jpg',
          mediaId: 9,
        } as any,
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'IMAGE');
      expect(prisma.departmentHighlight.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          imageUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
        }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'department_highlights',
        5,
        'imageUrl',
        9,
      );
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.departmentHighlight.findFirst.mockResolvedValue({
        id: 1,
        version: 2,
      });

      await expect(
        service.update(1, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.departmentHighlight.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
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
  });
});
