import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { NewsService } from './news.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';

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
  let mediaLink: { prepareLink: jest.Mock; syncUsage: jest.Mock; untrackAll: jest.Mock };

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
        NewsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
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

    it('untracks Media usage on soft-delete', async () => {
      prisma.news.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.news.update.mockResolvedValue({ id: 1, deletedAt: new Date() });

      await service.softDelete(1, admin, undefined);

      expect(mediaLink.untrackAll).toHaveBeenCalledWith('news', 1);
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

    it('re-tracks Media usage on restore when the row still has a mediaId', async () => {
      prisma.news.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.news.update.mockResolvedValue({ id: 1, deletedAt: null, mediaId: 9 });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith('news', 1, 'imageUrl', 9);
    });

    it('does not re-track on restore when the row has no mediaId', async () => {
      prisma.news.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.news.update.mockResolvedValue({ id: 1, deletedAt: null, mediaId: null });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).not.toHaveBeenCalled();
    });
  });

  describe('Media Library linking', () => {
    it('on create, resolves imageUrl from mediaId and tracks usage', async () => {
      prisma.news.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          title: 'Exam Notice',
          content: 'Body',
          category: 'Examinations',
          imageUrl: '/fallback.jpg',
          mediaId: 9,
          date: '2026-07-09',
        } as any,
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'IMAGE');
      expect(prisma.news.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ imageUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE' }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith('news', 5, 'imageUrl', 9);
    });

    it('on update with mediaId: null, unlinks without touching imageUrl', async () => {
      prisma.news.findFirst.mockResolvedValue({ id: 1, version: 1, imageUrl: '/existing.jpg' });
      prisma.news.update.mockResolvedValue({ id: 1, version: 2 });

      await service.update(1, { mediaId: null, version: 1 } as any, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith('news', 1, 'imageUrl', null);
      expect(prisma.news.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.not.objectContaining({ imageUrl: expect.anything() }) }),
      );
    });
  });
});
