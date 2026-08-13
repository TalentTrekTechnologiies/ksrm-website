import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { SectionStatus } from '@prisma/client';
import { SectionsService } from './sections.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit-log/audit-log.service';

describe('SectionsService', () => {
  let service: SectionsService;
  let prisma: {
    homepageSection: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
  };
  let auditLog: { log: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      homepageSection: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(SectionsService);
  });

  describe('findPublicByKey', () => {
    it('only returns PUBLISHED, non-deleted sections', async () => {
      prisma.homepageSection.findFirst.mockResolvedValue(null);

      await service.findPublicByKey('vision');

      expect(prisma.homepageSection.findFirst).toHaveBeenCalledWith({
        where: {
          key: 'vision',
          status: SectionStatus.PUBLISHED,
          deletedAt: null,
        },
      });
    });
  });

  describe('findAdminByKey', () => {
    it('404s for an unknown key', async () => {
      prisma.homepageSection.findFirst.mockResolvedValue(null);

      await expect(service.findAdminByKey('bogus')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('409s on a stale version', async () => {
      prisma.homepageSection.findFirst.mockResolvedValue({
        id: 1,
        key: 'vision',
        status: SectionStatus.DRAFT,
        version: 3,
      });

      await expect(
        service.update(
          'vision',
          { text: 'x' },
          SectionStatus.PUBLISHED,
          1,
          admin,
          undefined,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('logs PUBLISH when status transitions DRAFT -> PUBLISHED', async () => {
      prisma.homepageSection.findFirst.mockResolvedValue({
        id: 1,
        key: 'vision',
        status: SectionStatus.DRAFT,
        version: 1,
      });
      prisma.homepageSection.update.mockResolvedValue({
        id: 1,
        key: 'vision',
        status: SectionStatus.PUBLISHED,
        version: 2,
      });

      await service.update(
        'vision',
        { text: 'x' },
        SectionStatus.PUBLISHED,
        1,
        admin,
        'req-1',
      );

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'PUBLISH',
          module: 'homepage_section_vision',
          requestId: 'req-1',
        }),
      );
    });

    it('logs UNPUBLISH when status transitions PUBLISHED -> DRAFT', async () => {
      prisma.homepageSection.findFirst.mockResolvedValue({
        id: 1,
        key: 'vision',
        status: SectionStatus.PUBLISHED,
        version: 2,
      });
      prisma.homepageSection.update.mockResolvedValue({
        id: 1,
        key: 'vision',
        status: SectionStatus.DRAFT,
        version: 3,
      });

      await service.update(
        'vision',
        { text: 'x' },
        SectionStatus.DRAFT,
        2,
        admin,
        undefined,
      );

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UNPUBLISH',
          module: 'homepage_section_vision',
        }),
      );
    });

    it('logs a plain UPDATE when status does not change', async () => {
      prisma.homepageSection.findFirst.mockResolvedValue({
        id: 1,
        key: 'vision',
        status: SectionStatus.PUBLISHED,
        version: 2,
      });
      prisma.homepageSection.update.mockResolvedValue({
        id: 1,
        key: 'vision',
        status: SectionStatus.PUBLISHED,
        version: 3,
      });

      await service.update(
        'vision',
        { text: 'x' },
        SectionStatus.PUBLISHED,
        2,
        admin,
        undefined,
      );

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE' }),
      );
    });
  });
});
