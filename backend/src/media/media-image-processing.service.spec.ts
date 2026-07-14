import { Test, TestingModule } from '@nestjs/testing';
import { MediaImageProcessingService } from './media-image-processing.service';
import { PrismaService } from '../prisma/prisma.service';
import { LocalDiskStorageAdapter } from './storage/local-disk-storage.adapter';

describe('MediaImageProcessingService', () => {
  let service: MediaImageProcessingService;
  let prisma: { mediaVariant: { findMany: jest.Mock; deleteMany: jest.Mock } };
  let storage: { delete: jest.Mock };

  beforeEach(async () => {
    prisma = {
      mediaVariant: { findMany: jest.fn(), deleteMany: jest.fn() },
    };
    storage = { delete: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaImageProcessingService,
        { provide: PrismaService, useValue: prisma },
        { provide: LocalDiskStorageAdapter, useValue: storage },
      ],
    }).compile();

    service = module.get(MediaImageProcessingService);
  });

  describe('deleteVariantsForMedia', () => {
    it('deletes every derived variant file when no protectStorageKey is given', async () => {
      prisma.mediaVariant.findMany.mockResolvedValue([
        { storageKey: 'a.webp' },
        { storageKey: 'b.webp' },
      ]);

      await service.deleteVariantsForMedia(1);

      expect(storage.delete).toHaveBeenCalledWith('a.webp');
      expect(storage.delete).toHaveBeenCalledWith('b.webp');
      expect(prisma.mediaVariant.deleteMany).toHaveBeenCalledWith({ where: { mediaId: 1 } });
    });

    it('does NOT delete the file when a variant shares the archival storageKey (VIDEO/DOCUMENT/SVG case)', async () => {
      // For non-image types, registerSourceOnlyVariant's sole ORIGINAL/SOURCE
      // variant points at the SAME storageKey as the archival Media row -
      // deleting it here would destroy the file a just-taken MediaVersion
      // snapshot still references (this was a real crash-causing bug: the
      // file-serving route then 500s/crashes trying to read a missing file).
      prisma.mediaVariant.findMany.mockResolvedValue([{ storageKey: 'archival-original.mp4' }]);

      await service.deleteVariantsForMedia(1, 'archival-original.mp4');

      expect(storage.delete).not.toHaveBeenCalled();
      expect(prisma.mediaVariant.deleteMany).toHaveBeenCalledWith({ where: { mediaId: 1 } });
    });

    it('deletes non-protected variants while sparing the one matching protectStorageKey', async () => {
      prisma.mediaVariant.findMany.mockResolvedValue([
        { storageKey: 'archival-original.jpg' },
        { storageKey: 'thumbnail.webp' },
      ]);

      await service.deleteVariantsForMedia(1, 'archival-original.jpg');

      expect(storage.delete).not.toHaveBeenCalledWith('archival-original.jpg');
      expect(storage.delete).toHaveBeenCalledWith('thumbnail.webp');
    });
  });
});
