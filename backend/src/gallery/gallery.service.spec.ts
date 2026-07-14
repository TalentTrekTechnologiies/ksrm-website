import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';

describe('GalleryService', () => {
  let service: GalleryService;
  let prisma: {
    galleryImage: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };
  let mediaLink: { prepareLink: jest.Mock; syncUsage: jest.Mock; untrackAll: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      galleryImage: {
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
        GalleryService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
      ],
    }).compile();

    service = module.get(GalleryService);
  });

  describe('findAllPublic', () => {
    it('only returns active, non-deleted rows ordered by sortOrder', async () => {
      prisma.galleryImage.findMany.mockResolvedValue([]);

      await service.findAllPublic();

      expect(prisma.galleryImage.findMany).toHaveBeenCalledWith({
        where: { isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('auto-assigns sortOrder to the current count when not provided', async () => {
      prisma.galleryImage.count.mockResolvedValue(4);
      prisma.galleryImage.create.mockResolvedValue({ id: 5, sortOrder: 4 });

      await service.create(
        { title: 'Campus', imageUrl: '/gallery/campus.jpg' } as any,
        admin,
        undefined,
      );

      expect(prisma.galleryImage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ sortOrder: 4, category: '' }),
      });
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.galleryImage.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.galleryImage.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes instead of hard-deleting', async () => {
      prisma.galleryImage.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.galleryImage.update.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
        deletedBy: 1,
      });

      await service.softDelete(1, admin, undefined);

      expect(prisma.galleryImage.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          deletedBy: 1,
          version: { increment: 1 },
        }),
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'gallery' }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.galleryImage.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('restores by clearing deletedAt/deletedBy and logs RESTORE', async () => {
      prisma.galleryImage.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.galleryImage.update.mockResolvedValue({ id: 1, deletedAt: null });

      await service.restore(1, admin, undefined);

      expect(prisma.galleryImage.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'RESTORE' }),
      );
    });

    it('untracks Media usage on soft-delete', async () => {
      prisma.galleryImage.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.galleryImage.update.mockResolvedValue({ id: 1, deletedAt: new Date() });

      await service.softDelete(1, admin, undefined);

      expect(mediaLink.untrackAll).toHaveBeenCalledWith('gallery', 1);
    });

    it('re-tracks Media usage on restore when the row still has a mediaId', async () => {
      prisma.galleryImage.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.galleryImage.update.mockResolvedValue({ id: 1, deletedAt: null, mediaId: 9 });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith('gallery', 1, 'imageUrl', 9);
    });

    it('does not re-track on restore when the row has no mediaId', async () => {
      prisma.galleryImage.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.galleryImage.update.mockResolvedValue({ id: 1, deletedAt: null, mediaId: null });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).not.toHaveBeenCalled();
    });
  });

  describe('Media Library linking', () => {
    it('on create, resolves imageUrl from mediaId and tracks usage', async () => {
      prisma.galleryImage.count.mockResolvedValue(0);
      prisma.galleryImage.create.mockResolvedValue({ id: 5 });

      await service.create(
        { title: 'Campus', imageUrl: '/fallback.jpg', mediaId: 9 } as any,
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'IMAGE');
      expect(prisma.galleryImage.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ imageUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE' }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith('gallery', 5, 'imageUrl', 9);
    });

    it('on update with mediaId: null, unlinks without touching imageUrl', async () => {
      prisma.galleryImage.findFirst.mockResolvedValue({ id: 1, version: 1, imageUrl: '/existing.jpg' });
      prisma.galleryImage.update.mockResolvedValue({ id: 1, version: 2 });

      await service.update(1, { mediaId: null, version: 1 } as any, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith('gallery', 1, 'imageUrl', null);
      expect(prisma.galleryImage.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.not.objectContaining({ imageUrl: expect.anything() }) }),
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
      prisma.galleryImage.findMany
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]) // existence check
        .mockResolvedValueOnce([{ id: 2 }, { id: 1 }]); // final findAllAdmin
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
