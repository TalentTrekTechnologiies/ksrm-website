import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';
import { MediaStatsService } from '../media/media-stats.service';
import { NotificationService } from '../mailer/notification.service';

describe('SiteSettingsService', () => {
  let service: SiteSettingsService;
  let prisma: {
    siteSetting: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let auditLog: { log: jest.Mock };
  let mediaLink: {
    prepareLink: jest.Mock;
    syncUsage: jest.Mock;
    untrackAll: jest.Mock;
  };
  let mediaStats: { getStats: jest.Mock };
  let notification: { send: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      siteSetting: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
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
    mediaStats = {
      getStats: jest
        .fn()
        .mockResolvedValue({ counts: {}, totalSizeBytes: '12345' }),
    };
    notification = { send: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteSettingsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
        { provide: MediaStatsService, useValue: mediaStats },
        { provide: NotificationService, useValue: notification },
      ],
    }).compile();

    service = module.get(SiteSettingsService);
  });

  describe('findAllPublic', () => {
    it('only queries isPublic:true rows, excludes homepage_visibility, and collapses to a key/value map', async () => {
      prisma.siteSetting.findMany.mockResolvedValue([
        {
          key: 'site.collegeName',
          value: 'KSRM College',
          type: 'STRING',
          group: 'branding',
        },
        {
          key: 'site.logoUrl',
          value: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
          type: 'IMAGE_URL',
          group: 'branding',
        },
      ]);

      const result = await service.findAllPublic();

      expect(prisma.siteSetting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isPublic: true,
            AND: [{ group: { notIn: ['homepage_visibility'] } }],
          },
        }),
      );
      expect(result).toEqual({
        'site.collegeName': 'KSRM College',
        'site.logoUrl': 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
      });
    });

    it('filters by group when given, WITHOUT losing the exclusion (regression: a naive spread would overwrite it)', async () => {
      prisma.siteSetting.findMany.mockResolvedValue([]);

      await service.findAllPublic('branding');

      expect(prisma.siteSetting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            isPublic: true,
            AND: [
              { group: { notIn: ['homepage_visibility'] } },
              { group: 'branding' },
            ],
          },
        }),
      );
    });
  });

  describe('findAll', () => {
    it('excludes the homepage_visibility group (SectionVisibilityService storage, not a real site setting)', async () => {
      prisma.siteSetting.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(prisma.siteSetting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { AND: [{ group: { notIn: ['homepage_visibility'] } }] },
        }),
      );
    });

    it('filters by group when given, without losing the exclusion', async () => {
      prisma.siteSetting.findMany.mockResolvedValue([]);

      await service.findAll('branding');

      expect(prisma.siteSetting.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              { group: { notIn: ['homepage_visibility'] } },
              { group: 'branding' },
            ],
          },
        }),
      );
    });
  });

  describe('update', () => {
    it('404s when the setting does not exist', async () => {
      prisma.siteSetting.findUnique.mockResolvedValue(null);

      await expect(
        service.update(99, { value: 'x' } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('delete', () => {
    it('is a real delete (no soft-delete columns) and untracks Media usage', async () => {
      prisma.siteSetting.findUnique.mockResolvedValue({
        id: 1,
        key: 'site.logo',
      });
      prisma.siteSetting.delete.mockResolvedValue({ id: 1, key: 'site.logo' });

      await service.delete(1, admin, undefined);

      expect(prisma.siteSetting.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mediaLink.untrackAll).toHaveBeenCalledWith('site_settings', 1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'site_settings' }),
      );
    });
  });

  describe('Media Library linking', () => {
    it('on create, resolves value from mediaId (IMAGE type) and tracks usage', async () => {
      prisma.siteSetting.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          key: 'site.logo',
          value: '/fallback.png',
          mediaId: 9,
          type: 'IMAGE_URL',
          group: 'branding',
        } as any,
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'IMAGE');
      expect(prisma.siteSetting.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          value: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
        }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'site_settings',
        5,
        'value',
        9,
      );
    });

    it('on update with mediaId: null, unlinks without touching value', async () => {
      prisma.siteSetting.findUnique.mockResolvedValue({
        id: 1,
        value: '/existing.png',
      });
      prisma.siteSetting.update.mockResolvedValue({ id: 1 });

      await service.update(1, { mediaId: null }, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'site_settings',
        1,
        'value',
        null,
      );
      expect(prisma.siteSetting.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ value: expect.anything() }),
        }),
      );
    });

    it('leaves value untouched on update when mediaId is not provided at all', async () => {
      prisma.siteSetting.findUnique.mockResolvedValue({
        id: 1,
        value: '/existing.txt',
      });
      prisma.siteSetting.update.mockResolvedValue({ id: 1 });

      await service.update(
        1,
        { description: 'updated note' },
        admin,
        undefined,
      );

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'site_settings',
        1,
        'value',
        undefined,
      );
      expect(prisma.siteSetting.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ value: expect.anything() }),
        }),
      );
    });
  });

  describe('getSystemInfo', () => {
    it('returns version, environment, and storage used from MediaStatsService', async () => {
      const result = await service.getSystemInfo();

      expect(result).toEqual(
        expect.objectContaining({
          version: expect.any(String),
          environment: expect.any(String),
          storageUsedBytes: '12345',
        }),
      );
      expect(mediaStats.getStats).toHaveBeenCalled();
    });
  });

  describe('sendTestEmail', () => {
    it('sends via NotificationService and audit-logs the attempt', async () => {
      const result = await service.sendTestEmail(
        'recipient@ksrm.edu',
        admin,
        'req-1',
      );

      expect(notification.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'recipient@ksrm.edu',
          subject: expect.any(String),
        }),
      );
      expect(result).toEqual({ sent: true, to: 'recipient@ksrm.edu' });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          module: 'site_settings',
          requestId: 'req-1',
        }),
      );
    });
  });
});
