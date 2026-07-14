import { Test, TestingModule } from '@nestjs/testing';
import { MediaUsageService } from './media-usage.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MediaUsageService', () => {
  let service: MediaUsageService;
  let prisma: {
    mediaUsage: {
      upsert: jest.Mock;
      deleteMany: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      mediaUsage: {
        upsert: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaUsageService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(MediaUsageService);
  });

  describe('track', () => {
    it('upserts on the (mediaId, module, recordId, field) unique key so repeat calls are idempotent', async () => {
      prisma.mediaUsage.upsert.mockResolvedValue({});

      await service.track(1, 'gallery', 5, 'imageUrl');

      expect(prisma.mediaUsage.upsert).toHaveBeenCalledWith({
        where: {
          mediaId_module_recordId_field: {
            mediaId: 1,
            module: 'gallery',
            recordId: 5,
            field: 'imageUrl',
          },
        },
        update: {},
        create: { mediaId: 1, module: 'gallery', recordId: 5, field: 'imageUrl' },
      });
    });
  });

  describe('untrack', () => {
    it('deletes only the matching (module, recordId, field) row', async () => {
      prisma.mediaUsage.deleteMany.mockResolvedValue({ count: 1 });

      await service.untrack('gallery', 5, 'imageUrl');

      expect(prisma.mediaUsage.deleteMany).toHaveBeenCalledWith({
        where: { module: 'gallery', recordId: 5, field: 'imageUrl' },
      });
    });
  });

  describe('untrackAll', () => {
    it('deletes every usage row for a whole consumer record, regardless of field', async () => {
      prisma.mediaUsage.deleteMany.mockResolvedValue({ count: 3 });

      await service.untrackAll('gallery', 5);

      expect(prisma.mediaUsage.deleteMany).toHaveBeenCalledWith({
        where: { module: 'gallery', recordId: 5 },
      });
    });
  });

  describe('isReferenced', () => {
    it('returns true when at least one usage row exists', async () => {
      prisma.mediaUsage.count.mockResolvedValue(2);

      await expect(service.isReferenced(1)).resolves.toBe(true);
    });

    it('returns false when no usage rows exist', async () => {
      prisma.mediaUsage.count.mockResolvedValue(0);

      await expect(service.isReferenced(1)).resolves.toBe(false);
    });
  });

  describe('getUsagesForMedia', () => {
    it('orders by module then recordId for a stable "Used In" list', async () => {
      prisma.mediaUsage.findMany.mockResolvedValue([]);

      await service.getUsagesForMedia(1);

      expect(prisma.mediaUsage.findMany).toHaveBeenCalledWith({
        where: { mediaId: 1 },
        orderBy: [{ module: 'asc' }, { recordId: 'asc' }],
      });
    });
  });
});
