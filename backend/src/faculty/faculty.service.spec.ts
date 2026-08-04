import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';

describe('FacultyService', () => {
  let service: FacultyService;
  let prisma: {
    faculty: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      aggregate: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };
  let mediaLink: { prepareLink: jest.Mock; syncUsage: jest.Mock; untrackAll: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      faculty: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        // create() reads the current highest sortOrder so a new member lands at
        // the end of the roster rather than the top.
        aggregate: jest.fn().mockResolvedValue({ _max: { sortOrder: 4 } }),
      },
      $transaction: jest.fn().mockResolvedValue([]),
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };
    mediaLink = {
      prepareLink: jest.fn().mockImplementation((mediaId: number | null | undefined) =>
        mediaId === undefined || mediaId === null
          ? Promise.resolve(undefined)
          : Promise.resolve('http://localhost:4000/media/file/9/ORIGINAL/SOURCE'),
      ),
      syncUsage: jest.fn().mockResolvedValue(undefined),
      untrackAll: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacultyService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
      ],
    }).compile();

    service = module.get(FacultyService);
  });

  describe('findAll', () => {
    it('only returns active, non-deleted rows ordered by name', async () => {
      prisma.faculty.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(prisma.faculty.findMany).toHaveBeenCalledWith({
        where: { isActive: true, deletedAt: null },
        // HOD leads the grid, then roster order, then alphabetical.
        orderBy: [{ isHod: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
      });
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.faculty.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.faculty.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and untracks Media usage', async () => {
      prisma.faculty.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.faculty.update.mockResolvedValue({ id: 1, deletedAt: new Date(), deletedBy: 1 });

      await service.softDelete(1, admin, undefined);

      expect(mediaLink.untrackAll).toHaveBeenCalledWith('faculty', 1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'faculty' }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.faculty.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('re-tracks Media usage on restore when the row still has a mediaId', async () => {
      prisma.faculty.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.faculty.update.mockResolvedValue({ id: 1, deletedAt: null, mediaId: 9 });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith('faculty', 1, 'photoUrl', 9);
    });

    it('does not re-track on restore when the row has no mediaId', async () => {
      prisma.faculty.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.faculty.update.mockResolvedValue({ id: 1, deletedAt: null, mediaId: null });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).not.toHaveBeenCalled();
    });
  });

  describe('ordering', () => {
    // A new colleague appearing at the top of a roster somebody has already
    // arranged is never what adding them was meant to do.
    it('appends a new member after the current last one', async () => {
      prisma.faculty.aggregate.mockResolvedValue({ _max: { sortOrder: 7 } });
      prisma.faculty.create.mockResolvedValue({ id: 5 });

      await service.create(
        { name: 'New Person', designation: 'Assistant Professor', qualification: 'M.Tech', department: 'CSE' },
        admin,
        undefined,
      );

      expect(prisma.faculty.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ sortOrder: 8 }) }),
      );
    });

    it('starts at 1 for the first member of an empty department', async () => {
      prisma.faculty.aggregate.mockResolvedValue({ _max: { sortOrder: null } });
      prisma.faculty.create.mockResolvedValue({ id: 1 });

      await service.create(
        { name: 'First', designation: 'Professor', qualification: 'PhD', department: 'CSE' },
        admin,
        undefined,
      );

      expect(prisma.faculty.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ sortOrder: 1 }) }),
      );
    });

    // Reordering changes sortOrder and nothing an edit form is holding, so
    // bumping the optimistic-lock version made every open form stale and the
    // admin got "changed by someone else" when nobody had.
    it('does not bump the optimistic-lock version when reordering', async () => {
      prisma.faculty.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      prisma.$transaction.mockResolvedValue([]);

      await service.reorder({ items: [{ id: 1, sortOrder: 0 }, { id: 2, sortOrder: 1 }] }, admin, undefined);

      for (const call of prisma.faculty.update.mock.calls) {
        expect(call[0].data).not.toHaveProperty('version');
      }
    });
  });

  describe('Media Library linking', () => {
    it('on create, resolves photoUrl from mediaId and tracks usage', async () => {
      prisma.faculty.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          name: 'Jane Doe',
          designation: 'Professor',
          qualification: 'PhD',
          department: 'CSE',
          photoUrl: '/fallback.jpg',
          mediaId: 9,
        } as any,
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'IMAGE');
      expect(prisma.faculty.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ photoUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE' }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith('faculty', 5, 'photoUrl', 9);
    });

    it('on update with mediaId: null, unlinks without touching photoUrl', async () => {
      prisma.faculty.findFirst.mockResolvedValue({ id: 1, version: 1, photoUrl: '/existing.jpg' });
      prisma.faculty.update.mockResolvedValue({ id: 1, version: 2 });

      await service.update(1, { mediaId: null, version: 1 } as any, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith('faculty', 1, 'photoUrl', null);
      expect(prisma.faculty.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.not.objectContaining({ photoUrl: expect.anything() }) }),
      );
    });
  });
});
