import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ResearchService } from './research.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';

describe('ResearchService', () => {
  let service: ResearchService;
  let prisma: {
    research: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    department: { findUnique: jest.Mock };
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
      research: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      department: { findUnique: jest.fn() },
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
        ResearchService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
      ],
    }).compile();

    service = module.get(ResearchService);
  });

  describe('findAllPublic', () => {
    it('returns every active record when no departmentId is given', async () => {
      prisma.research.findMany.mockResolvedValue([]);

      await service.findAllPublic();

      expect(prisma.research.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      });
    });

    it('scopes to one department when an id is given', async () => {
      prisma.research.findMany.mockResolvedValue([]);

      await service.findAllPublic(3);

      expect(prisma.research.findMany).toHaveBeenCalledWith({
        where: { isActive: true, departmentId: 3 },
        orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
      });
    });
  });

  describe('create', () => {
    it('resolves the department label from departmentId and tracks Media usage', async () => {
      prisma.department.findUnique.mockResolvedValue({
        name: 'Computer Science',
      });
      prisma.research.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          title: 'A Paper',
          authors: 'A. Author',
          year: 2026,
          departmentId: 3,
          type: 'Publication',
          mediaId: 9,
        },
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'DOCUMENT');
      expect(prisma.research.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          department: 'Computer Science',
          attachmentUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
        }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'research',
        5,
        'attachmentUrl',
        9,
      );
    });

    it('falls back to "General" when neither departmentId nor department is given', async () => {
      prisma.research.create.mockResolvedValue({ id: 6 });

      await service.create(
        {
          title: 'A Paper',
          authors: 'A. Author',
          year: 2026,
          type: 'Publication',
        },
        admin,
        undefined,
      );

      expect(prisma.research.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ department: 'General' }),
      });
    });
  });

  describe('update', () => {
    it('404s when the record does not exist', async () => {
      prisma.research.findUnique.mockResolvedValue(null);

      await expect(
        service.update(99, { title: 'x' } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes and untracks Media usage', async () => {
      prisma.research.findUnique.mockResolvedValue({ id: 1 });
      prisma.research.delete.mockResolvedValue({ id: 1 });

      await service.delete(1, admin, undefined);

      expect(mediaLink.untrackAll).toHaveBeenCalledWith('research', 1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'research' }),
      );
    });
  });
});
