import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MediaService } from './media.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaValidationService } from './media-validation.service';
import { MediaImageProcessingService } from './media-image-processing.service';
import { MediaProcessingQueueService } from './media-processing-queue.service';
import { MediaUsageService } from './media-usage.service';
import { LocalDiskStorageAdapter } from './storage/local-disk-storage.adapter';

jest.mock('fs/promises', () => ({
  ...jest.requireActual('fs/promises'),
  rm: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createReadStream: jest.fn(() => ({
    on: (event: string, cb: (arg?: unknown) => void) => {
      if (event === 'end') cb();
      return { on: jest.fn() };
    },
  })),
}));

describe('MediaService', () => {
  let service: MediaService;
  let prisma: {
    media: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      groupBy: jest.Mock;
    };
    mediaVariant: { findMany: jest.Mock };
    mediaVersion: { findFirst: jest.Mock; create: jest.Mock };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };
  let validation: { validate: jest.Mock };
  let usageService: { getUsagesForMedia: jest.Mock; isReferenced: jest.Mock };
  let storage: { save: jest.Mock; delete: jest.Mock };
  let imageProcessing: { deleteVariantsForMedia: jest.Mock };
  let processingQueue: { enqueue: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu', isSuperAdmin: false };
  const superAdmin = { id: 2, name: 'Super', email: 'super@ksrm.edu', isSuperAdmin: true };

  beforeEach(async () => {
    prisma = {
      media: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
      mediaVariant: { findMany: jest.fn().mockResolvedValue([]) },
      mediaVersion: { findFirst: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({}) },
      $transaction: jest.fn(),
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };
    validation = {
      validate: jest.fn().mockResolvedValue({ type: 'IMAGE', extension: 'png' }),
    };
    usageService = {
      getUsagesForMedia: jest.fn().mockResolvedValue([]),
      isReferenced: jest.fn(),
    };
    storage = {
      save: jest.fn().mockResolvedValue({ storageKey: 'k', sizeBytes: 100 }),
      delete: jest.fn().mockResolvedValue(undefined),
    };
    imageProcessing = { deleteVariantsForMedia: jest.fn().mockResolvedValue(undefined) };
    processingQueue = { enqueue: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaValidationService, useValue: validation },
        { provide: MediaImageProcessingService, useValue: imageProcessing },
        { provide: MediaProcessingQueueService, useValue: processingQueue },
        { provide: MediaUsageService, useValue: usageService },
        { provide: LocalDiskStorageAdapter, useValue: storage },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();

    service = module.get(MediaService);
  });

  describe('upload / dedup', () => {
    const file = {
      path: '/tmp/whatever.png',
      originalname: 'photo.png',
      mimetype: 'image/png',
      size: 100,
    } as Express.Multer.File;

    it('reuses the existing row and does not touch storage when the checksum already exists', async () => {
      prisma.media.findFirst.mockResolvedValue({ id: 5, checksumSha256: 'abc' });

      const result = await service.upload(file, {}, admin);

      expect(result.deduplicated).toBe(true);
      expect(result.media).toEqual(expect.objectContaining({ id: 5 }));
      expect(storage.save).not.toHaveBeenCalled();
      expect(prisma.media.create).not.toHaveBeenCalled();
      expect(processingQueue.enqueue).not.toHaveBeenCalled();
    });

    it('restores a soft-deleted row instead of erroring when re-uploaded content matches its checksum', async () => {
      // checksumSha256 is a DB-level unique column not scoped to deletedAt,
      // so a plain create() for "new" content matching a soft-deleted row's
      // checksum would violate that constraint - upload() must detect this
      // and restore instead.
      prisma.media.findFirst.mockResolvedValue({
        id: 7,
        checksumSha256: 'abc',
        deletedAt: new Date('2026-01-01'),
      });
      prisma.media.update.mockResolvedValue({ id: 7, deletedAt: null, version: 2 });

      const result = await service.upload(file, {}, admin, 'req-2');

      expect(result.deduplicated).toBe(true);
      expect(storage.save).not.toHaveBeenCalled();
      expect(prisma.media.create).not.toHaveBeenCalled();
      expect(prisma.media.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'RESTORE', module: 'media', targetId: 7, requestId: 'req-2' }),
      );
    });

    it('stores, creates a PENDING row, audits CREATE, and enqueues processing for a new file', async () => {
      prisma.media.findFirst.mockResolvedValue(null);
      prisma.media.create.mockResolvedValue({ id: 9, processingStatus: 'PENDING' });

      const result = await service.upload(file, { title: 'A Photo' }, admin, 'req-1');

      expect(result.deduplicated).toBe(false);
      expect(storage.save).toHaveBeenCalledWith(file.path, 'png', file.mimetype);
      expect(prisma.media.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ processingStatus: 'PENDING', title: 'A Photo' }),
        }),
      );
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', module: 'media', requestId: 'req-1' }),
      );
      expect(processingQueue.enqueue).toHaveBeenCalledWith(9);
    });
  });

  describe('replace', () => {
    const file = {
      path: '/tmp/new-photo.png',
      originalname: 'new-photo.png',
      mimetype: 'image/png',
      size: 200,
    } as Express.Multer.File;
    const existingMedia = {
      id: 33,
      type: 'IMAGE',
      storageKey: 'old-key.png',
      mimeType: 'image/png',
      sizeBytes: 100,
      checksumSha256: 'old-checksum',
      width: 10,
      height: 10,
      deletedAt: null,
    };

    beforeEach(() => {
      prisma.media.findFirst.mockResolvedValue(existingMedia);
      // findUnique is used both for the collision check AND by the final
      // findOne(id) call replace() makes before returning - tests that
      // reach the success path override the first call only, so the
      // trailing findOne() still resolves the (now-updated) row.
      prisma.media.findUnique.mockResolvedValue(existingMedia);
    });

    it('rejects with 409 and touches nothing when the new file collides with a DIFFERENT media row', async () => {
      // Regression test: this exact scenario used to reach prisma.media.update()
      // (after already deleting the old variants) and surface as a raw,
      // unhandled Prisma unique-constraint 500 - leaving the asset 404ing
      // with no way to recover the deleted variants. See media.service.ts
      // replace()'s collision-check comment for the full story.
      prisma.media.findUnique.mockResolvedValue({ id: 29, originalFilename: 'other.png' });

      await expect(service.replace(33, file, admin)).rejects.toBeInstanceOf(ConflictException);

      expect(storage.save).not.toHaveBeenCalled();
      expect(prisma.media.update).not.toHaveBeenCalled();
      expect(imageProcessing.deleteVariantsForMedia).not.toHaveBeenCalled();
    });

    it('does not treat matching its own current checksum as a collision (no-op re-upload of identical content)', async () => {
      prisma.media.findUnique.mockResolvedValueOnce({ id: 33, originalFilename: 'new-photo.png' });
      prisma.media.update.mockResolvedValue({ id: 33 });

      await service.replace(33, file, admin);

      expect(prisma.media.update).toHaveBeenCalled();
    });

    it('only deletes the old variants AFTER the media row update succeeds, not before', async () => {
      prisma.media.findUnique.mockResolvedValueOnce(null);
      prisma.media.update.mockResolvedValue({ id: 33 });

      await service.replace(33, file, admin);

      const updateOrder = prisma.media.update.mock.invocationCallOrder[0];
      const deleteOrder = imageProcessing.deleteVariantsForMedia.mock.invocationCallOrder[0];
      expect(updateOrder).toBeLessThan(deleteOrder);
      expect(imageProcessing.deleteVariantsForMedia).toHaveBeenCalledWith(33, existingMedia.storageKey);
    });

    it('cleans up the newly-saved (now-orphaned) file and preserves the old variants when the update fails', async () => {
      prisma.media.findUnique.mockResolvedValue(null);
      prisma.media.update.mockRejectedValue(new Error('db exploded'));

      await expect(service.replace(33, file, admin)).rejects.toThrow('db exploded');

      expect(storage.delete).toHaveBeenCalledWith('k');
      expect(imageProcessing.deleteVariantsForMedia).not.toHaveBeenCalled();
    });
  });

  describe('softDelete - delete protection', () => {
    beforeEach(() => {
      prisma.media.findFirst.mockResolvedValue({ id: 1, deletedAt: null });
      prisma.media.update.mockResolvedValue({ id: 1, deletedAt: new Date() });
    });

    it('deletes immediately when nothing references the media', async () => {
      usageService.getUsagesForMedia.mockResolvedValue([]);

      await service.softDelete(1, admin, undefined, false);

      expect(prisma.media.update).toHaveBeenCalled();
    });

    it('409s with the usage list when referenced and not forced', async () => {
      usageService.getUsagesForMedia.mockResolvedValue([
        { module: 'gallery', recordId: 5, field: 'imageUrl' },
      ]);

      await expect(service.softDelete(1, admin, undefined, false)).rejects.toBeInstanceOf(
        ConflictException,
      );
      expect(prisma.media.update).not.toHaveBeenCalled();
    });

    it('403s a forced delete from a non-super-admin when the media is still referenced', async () => {
      usageService.getUsagesForMedia.mockResolvedValue([
        { module: 'gallery', recordId: 5, field: 'imageUrl' },
      ]);

      await expect(service.softDelete(1, admin, undefined, true)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });

    it('allows a forced delete from a super admin even when referenced', async () => {
      usageService.getUsagesForMedia.mockResolvedValue([
        { module: 'gallery', recordId: 5, field: 'imageUrl' },
      ]);

      await service.softDelete(1, superAdmin, undefined, true);

      expect(prisma.media.update).toHaveBeenCalled();
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', details: expect.objectContaining({ forced: true }) }),
      );
    });
  });
});
