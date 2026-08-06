import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';

describe('DownloadsService', () => {
  let service: DownloadsService;
  let prisma: {
    download: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      // Added when uploads started going to the TOP of the list: the service
      // takes min(sortOrder) - 1 rather than count(), so a new document is
      // first rather than buried at the bottom.
      aggregate: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };
  let mediaLink: { prepareLink: jest.Mock; syncUsage: jest.Mock; untrackAll: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      download: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _min: { sortOrder: 0 } }),
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
        DownloadsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
      ],
    }).compile();

    service = module.get(DownloadsService);
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.download.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.download.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and untracks Media usage', async () => {
      prisma.download.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.download.update.mockResolvedValue({ id: 1, deletedAt: new Date(), deletedBy: 1 });

      await service.softDelete(1, admin, undefined);

      expect(mediaLink.untrackAll).toHaveBeenCalledWith('downloads', 1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'downloads' }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.download.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('re-tracks Media usage on restore when the row still has a mediaId', async () => {
      prisma.download.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.download.update.mockResolvedValue({ id: 1, deletedAt: null, mediaId: 9 });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith('downloads', 1, 'fileUrl', 9);
    });

    it('does not re-track on restore when the row has no mediaId', async () => {
      prisma.download.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.download.update.mockResolvedValue({ id: 1, deletedAt: null, mediaId: null });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).not.toHaveBeenCalled();
    });
  });

  describe('Media Library linking', () => {
    it('on create, resolves fileUrl from mediaId (DOCUMENT type) and tracks usage', async () => {
      prisma.download.count.mockResolvedValue(0);
      prisma.download.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          title: 'Syllabus',
          category: 'SYLLABUS',
          fileUrl: '/fallback.pdf',
          mediaId: 9,
        } as any,
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'DOCUMENT');
      expect(prisma.download.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ fileUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE' }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith('downloads', 5, 'fileUrl', 9);
    });

    it('on update with mediaId: null, unlinks without touching fileUrl', async () => {
      prisma.download.findFirst.mockResolvedValue({ id: 1, version: 1, fileUrl: '/existing.pdf' });
      prisma.download.update.mockResolvedValue({ id: 1, version: 2 });

      await service.update(1, { mediaId: null, version: 1 } as any, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith('downloads', 1, 'fileUrl', null);
      expect(prisma.download.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.not.objectContaining({ fileUrl: expect.anything() }) }),
      );
    });
  });

  describe('reorder', () => {
    it('rejects duplicate sortOrder values before touching the database', async () => {
      await expect(
        service.reorder(
          { items: [{ id: 1, sortOrder: 0 }, { id: 2, sortOrder: 0 }] },
          admin,
          undefined,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
