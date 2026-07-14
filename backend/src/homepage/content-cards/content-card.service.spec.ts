import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ContentCardService } from './content-card.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { MediaLinkService } from '../../media/media-link.service';

describe('ContentCardService (generic, exercised via a Quick Links-shaped config)', () => {
  let service: ContentCardService;
  let prisma: {
    contentCard: {
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
  const AUDIT_MODULE = 'homepage_quick_links';
  const ENTITY_LABEL = 'Quick link';

  beforeEach(async () => {
    prisma = {
      contentCard: {
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
        ContentCardService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
      ],
    }).compile();

    service = module.get(ContentCardService);
  });

  it('lists only active, non-deleted cards for the public site', async () => {
    prisma.contentCard.findMany.mockResolvedValue([]);

    await service.findAllPublic('homepage_quick_links');

    expect(prisma.contentCard.findMany).toHaveBeenCalledWith({
      where: { section: 'homepage_quick_links', isActive: true, deletedAt: null },
      orderBy: { sortOrder: 'asc' },
    });
  });

  it('409s an update with a stale version', async () => {
    prisma.contentCard.findFirst.mockResolvedValue({ id: 1, version: 5 });

    await expect(
      service.update(1, { title: 'x', version: 1 } as any, admin, AUDIT_MODULE, ENTITY_LABEL, undefined),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('404s updating a card that does not exist, with the caller-provided entity label', async () => {
    prisma.contentCard.findFirst.mockResolvedValue(null);

    await expect(
      service.update(1, { title: 'x', version: 1 } as any, admin, AUDIT_MODULE, ENTITY_LABEL, undefined),
    ).rejects.toThrow('Quick link 1 not found');
  });

  it('soft-deletes and logs DELETE under the caller-provided audit module', async () => {
    prisma.contentCard.findFirst.mockResolvedValue({ id: 1, version: 1 });
    prisma.contentCard.update.mockResolvedValue({ id: 1, deletedAt: new Date() });

    await service.softDelete(1, admin, AUDIT_MODULE, ENTITY_LABEL, undefined);

    expect(auditLog.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'DELETE', module: AUDIT_MODULE }),
    );
  });

  it('restores and logs RESTORE', async () => {
    prisma.contentCard.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
    prisma.contentCard.update.mockResolvedValue({ id: 1, deletedAt: null });

    await service.restore(1, admin, AUDIT_MODULE, ENTITY_LABEL, undefined);

    expect(auditLog.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'RESTORE' }));
  });

  it('rejects a reorder payload with duplicate sortOrder values', async () => {
    await expect(
      service.reorder(
        { section: 'homepage_quick_links', items: [{ id: 1, sortOrder: 0 }, { id: 2, sortOrder: 0 }] },
        admin,
        AUDIT_MODULE,
        ENTITY_LABEL,
        undefined,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('reorders in a single transaction and logs REORDER', async () => {
    prisma.contentCard.findMany
      .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
      .mockResolvedValueOnce([{ id: 2 }, { id: 1 }]);
    prisma.$transaction.mockResolvedValue(undefined);

    await service.reorder(
      { section: 'homepage_quick_links', items: [{ id: 1, sortOrder: 1 }, { id: 2, sortOrder: 0 }] },
      admin,
      AUDIT_MODULE,
      ENTITY_LABEL,
      'req-4',
    );

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(auditLog.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'REORDER', requestId: 'req-4' }),
    );
  });

  it('reuses the exact same logic for a different section/module config (e.g. admission programs)', async () => {
    prisma.contentCard.count.mockResolvedValue(0);
    prisma.contentCard.create.mockResolvedValue({ id: 9, section: 'homepage_admission_programs' });

    await service.create(
      { section: 'homepage_admission_programs', imageUrl: '/x.png', title: 'B.Tech', linkUrl: '/x', tags: ['CSE'] },
      admin,
      'homepage_admission_programs',
      'Admission program',
      undefined,
    );

    expect(auditLog.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CREATE', module: 'homepage_admission_programs' }),
    );
  });

  describe('Media Library linking', () => {
    it('on create, resolves imageUrl from mediaId and tracks usage under the caller-provided module', async () => {
      prisma.contentCard.count.mockResolvedValue(0);
      prisma.contentCard.create.mockResolvedValue({ id: 9 });

      await service.create(
        { section: 'homepage_admission_programs', imageUrl: '/fallback.png', mediaId: 9, title: 'B.Tech', linkUrl: '/x', tags: ['CSE'] },
        admin,
        AUDIT_MODULE,
        ENTITY_LABEL,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'IMAGE');
      expect(prisma.contentCard.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ imageUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE' }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith(AUDIT_MODULE, 9, 'imageUrl', 9);
    });

    it('on update with mediaId: null, unlinks without touching imageUrl', async () => {
      prisma.contentCard.findFirst.mockResolvedValue({ id: 1, version: 1, imageUrl: '/existing.png' });
      prisma.contentCard.update.mockResolvedValue({ id: 1, version: 2 });

      await service.update(1, { mediaId: null, version: 1 }, admin, AUDIT_MODULE, ENTITY_LABEL, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(AUDIT_MODULE, 1, 'imageUrl', null);
      expect(prisma.contentCard.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.not.objectContaining({ imageUrl: expect.anything() }) }),
      );
    });

    it('untracks Media usage on soft-delete', async () => {
      prisma.contentCard.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.contentCard.update.mockResolvedValue({ id: 1, deletedAt: new Date() });

      await service.softDelete(1, admin, AUDIT_MODULE, ENTITY_LABEL, undefined);

      expect(mediaLink.untrackAll).toHaveBeenCalledWith(AUDIT_MODULE, 1);
    });

    it('re-tracks Media usage on restore when the row still has a mediaId', async () => {
      prisma.contentCard.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.contentCard.update.mockResolvedValue({ id: 1, deletedAt: null, mediaId: 9 });

      await service.restore(1, admin, AUDIT_MODULE, ENTITY_LABEL, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(AUDIT_MODULE, 1, 'imageUrl', 9);
    });
  });
});
