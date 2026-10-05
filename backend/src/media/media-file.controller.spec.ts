import { NotFoundException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { MediaFileController } from './media-file.controller';
import { PrismaService } from '../prisma/prisma.service';
import { LocalDiskStorageAdapter } from './storage/local-disk-storage.adapter';
import { isProtectedSection } from '../protected-docs/protected-sections';

describe('MediaFileController', () => {
  let prisma: {
    media: { findFirst: jest.Mock };
    mediaVariant: { findFirst: jest.Mock };
    download: { findFirst: jest.Mock };
  };
  let storage: { createReadStream: jest.Mock };
  let controller: MediaFileController;

  const req = { headers: {} } as Request;
  const res = () =>
    ({
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn(),
      headersSent: false,
    }) as unknown as Response;

  beforeEach(() => {
    prisma = {
      media: {
        findFirst: jest
          .fn()
          .mockResolvedValue({ id: 7, mimeType: 'application/pdf' }),
      },
      mediaVariant: {
        findFirst: jest.fn().mockResolvedValue({ id: 70, storageKey: 'k' }),
      },
      download: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    storage = {
      createReadStream: jest.fn().mockReturnValue({ on: jest.fn(), pipe: jest.fn() }),
    };
    controller = new MediaFileController(
      prisma as unknown as PrismaService,
      storage as unknown as LocalDiskStorageAdapter,
    );
  });

  it('404s the original of a document shown in the protected viewer', async () => {
    prisma.download.findFirst.mockResolvedValue({ id: 1 });

    await expect(
      controller.serve(7, 'ORIGINAL', 'SOURCE', undefined, req, res()),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(storage.createReadStream).not.toHaveBeenCalled();
  });

  it('looks for protected use across every row, deleted and inactive included', async () => {
    await controller.serve(7, 'ORIGINAL', 'SOURCE', undefined, req, res());

    const where = prisma.download.findFirst.mock.calls[0][0].where;
    expect(where.mediaId).toBe(7);
    expect(where).not.toHaveProperty('deletedAt');
    expect(where).not.toHaveProperty('isActive');
    expect(where.OR).toEqual(
      expect.arrayContaining([
        { pageSection: 'nba' },
        { pageSection: { startsWith: 'nba.' } },
      ]),
    );
  });

  it('serves a file no protected document uses', async () => {
    await controller.serve(7, 'ORIGINAL', 'SOURCE', undefined, req, res());

    expect(storage.createReadStream).toHaveBeenCalledWith('k');
  });
});

describe('isProtectedSection', () => {
  it.each([
    ['nba', true],
    ['nba.minutes', true],
    ['nba-certificates', false],
    ['naac', false],
    [null, false],
    ['', false],
  ])('%s -> %s', (section, expected) => {
    expect(isProtectedSection(section)).toBe(expected);
  });
});
