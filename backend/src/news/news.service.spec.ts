import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { NewsService } from './news.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('NewsService', () => {
  let service: NewsService;
  let prisma: {
    news: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let auditLog: { log: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      news: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(NewsService);
  });

  describe('findAllPublic', () => {
    it('only returns published, non-deleted articles, featured-first then newest', async () => {
      prisma.news.findMany.mockResolvedValue([]);

      await service.findAllPublic();

      expect(prisma.news.findMany).toHaveBeenCalledWith({
        where: { isPublished: true, deletedAt: null },
        orderBy: [{ isFeatured: 'desc' }, { date: 'desc' }],
      });
    });
  });

  describe('findAllAdmin', () => {
    it('includes drafts (isPublished: false) - this is the fix for the bug where editors could never see/edit an unpublished article', async () => {
      prisma.news.findMany.mockResolvedValue([]);

      await service.findAllAdmin();

      // No isPublished filter at all - drafts and published both included.
      expect(prisma.news.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { date: 'desc' },
      });
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.news.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.news.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes instead of hard-deleting - this is the fix for the previous prisma.news.delete() call', async () => {
      prisma.news.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.news.update.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
        deletedBy: 1,
      });

      await service.softDelete(1, admin, undefined);

      expect(prisma.news.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          deletedBy: 1,
          version: { increment: 1 },
        }),
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'news' }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.news.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('restores by clearing deletedAt/deletedBy and logs RESTORE', async () => {
      prisma.news.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.news.update.mockResolvedValue({ id: 1, deletedAt: null });

      await service.restore(1, admin, undefined);

      expect(prisma.news.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'RESTORE' }),
      );
    });
  });
});
