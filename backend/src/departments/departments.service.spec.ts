import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let prisma: {
    department: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
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
      department: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
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
        DepartmentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
      ],
    }).compile();

    service = module.get(DepartmentsService);
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.department.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.department.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and untracks Media usage', async () => {
      prisma.department.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.department.update.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
        deletedBy: 1,
      });

      await service.softDelete(1, admin, undefined);

      expect(mediaLink.untrackAll).toHaveBeenCalledWith('departments', 1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'departments' }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.department.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('re-tracks Media usage on restore when the row still has a heroMediaId', async () => {
      prisma.department.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      prisma.department.update.mockResolvedValue({
        id: 1,
        deletedAt: null,
        heroMediaId: 9,
      });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'departments',
        1,
        'heroImageUrl',
        9,
      );
    });

    it('does not re-track on restore when the row has no heroMediaId', async () => {
      prisma.department.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      prisma.department.update.mockResolvedValue({
        id: 1,
        deletedAt: null,
        heroMediaId: null,
      });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).not.toHaveBeenCalled();
    });
  });

  describe('Media Library linking', () => {
    it('on create, resolves heroImageUrl from heroMediaId and tracks usage', async () => {
      prisma.department.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          slug: 'cse',
          name: 'Computer Science',
          about: 'About text',
          heroImageUrl: '/fallback.jpg',
          heroMediaId: 9,
        },
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'IMAGE');
      expect(prisma.department.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          heroImageUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
        }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'departments',
        5,
        'heroImageUrl',
        9,
      );
    });

    it('on update with heroMediaId: null, unlinks without touching heroImageUrl', async () => {
      prisma.department.findFirst.mockResolvedValue({
        id: 1,
        version: 1,
        heroImageUrl: '/existing.jpg',
      });
      prisma.department.update.mockResolvedValue({ id: 1, version: 2 });

      await service.update(
        1,
        { heroMediaId: null, version: 1 },
        admin,
        undefined,
      );

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'departments',
        1,
        'heroImageUrl',
        null,
      );
      expect(prisma.department.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            heroImageUrl: expect.anything(),
          }),
        }),
      );
    });
  });
});
