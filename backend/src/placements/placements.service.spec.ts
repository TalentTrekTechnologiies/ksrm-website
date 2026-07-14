import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';

describe('PlacementsService', () => {
  let service: PlacementsService;
  let prisma: {
    placement: {
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
      placement: {
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
          : Promise.resolve(`http://localhost:4000/media/file/${mediaId}/ORIGINAL/SOURCE`),
      ),
      syncUsage: jest.fn().mockResolvedValue(undefined),
      untrackAll: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlacementsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
      ],
    }).compile();

    service = module.get(PlacementsService);
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and untracks Media usage for both fields', async () => {
      prisma.placement.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.placement.update.mockResolvedValue({ id: 1, deletedAt: new Date(), deletedBy: 1 });

      await service.softDelete(1, admin, undefined);

      expect(mediaLink.untrackAll).toHaveBeenCalledWith('placements', 1);
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.placement.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('re-tracks both media usages on restore when both ids are present', async () => {
      prisma.placement.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.placement.update.mockResolvedValue({
        id: 1,
        deletedAt: null,
        mediaId: 9,
        companyLogoMediaId: 10,
      });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith('placements', 1, 'imageUrl', 9);
      expect(mediaLink.syncUsage).toHaveBeenCalledWith('placements', 1, 'companyLogoUrl', 10);
    });

    it('does not re-track fields with no mediaId on restore', async () => {
      prisma.placement.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.placement.update.mockResolvedValue({
        id: 1,
        deletedAt: null,
        mediaId: null,
        companyLogoMediaId: null,
      });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).not.toHaveBeenCalled();
    });
  });

  describe('Media Library linking', () => {
    it('on create, resolves both imageUrl and companyLogoUrl from their mediaIds and tracks usage', async () => {
      prisma.placement.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          studentName: 'Jane Doe',
          company: 'Acme',
          package: '10 LPA',
          department: 'CSE',
          year: 2026,
          imageUrl: '/fallback-student.jpg',
          mediaId: 9,
          companyLogoUrl: '/fallback-logo.png',
          companyLogoMediaId: 10,
        } as any,
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'IMAGE');
      expect(mediaLink.prepareLink).toHaveBeenCalledWith(10, 'IMAGE');
      expect(prisma.placement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          imageUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
          companyLogoUrl: 'http://localhost:4000/media/file/10/ORIGINAL/SOURCE',
        }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith('placements', 5, 'imageUrl', 9);
      expect(mediaLink.syncUsage).toHaveBeenCalledWith('placements', 5, 'companyLogoUrl', 10);
    });

    it('on update with both mediaIds: null, unlinks both without touching either URL', async () => {
      prisma.placement.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.placement.update.mockResolvedValue({ id: 1, version: 2 });

      await service.update(
        1,
        { mediaId: null, companyLogoMediaId: null, version: 1 } as any,
        admin,
        undefined,
      );

      expect(mediaLink.syncUsage).toHaveBeenCalledWith('placements', 1, 'imageUrl', null);
      expect(mediaLink.syncUsage).toHaveBeenCalledWith('placements', 1, 'companyLogoUrl', null);
      expect(prisma.placement.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({
            imageUrl: expect.anything(),
            companyLogoUrl: expect.anything(),
          }),
        }),
      );
    });
  });
});
