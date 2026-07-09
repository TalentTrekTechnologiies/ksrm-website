import { Test, TestingModule } from '@nestjs/testing';
import { SectionVisibilityService } from './section-visibility.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit-log/audit-log.service';

describe('SectionVisibilityService', () => {
  let service: SectionVisibilityService;
  let prisma: {
    siteSetting: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      upsert: jest.Mock;
    };
  };
  let auditLog: { log: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      siteSetting: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionVisibilityService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(SectionVisibilityService);
  });

  describe('getAll', () => {
    it('defaults missing keys to visible: true', async () => {
      prisma.siteSetting.findMany.mockResolvedValue([
        { key: 'homepage.visibility.testimonials', value: 'false' },
      ]);

      const result = await service.getAll();

      expect(result).toContainEqual({ key: 'testimonials', visible: false });
      expect(result).toContainEqual({ key: 'recruiters', visible: true }); // no row -> defaults true
      expect(result).toHaveLength(6);
    });
  });

  describe('isVisible', () => {
    it('returns true when no setting row exists', async () => {
      prisma.siteSetting.findUnique.mockResolvedValue(null);
      await expect(service.isVisible('recruiters')).resolves.toBe(true);
    });

    it('returns false when the row is explicitly set to false', async () => {
      prisma.siteSetting.findUnique.mockResolvedValue({ value: 'false' });
      await expect(service.isVisible('recruiters')).resolves.toBe(false);
    });
  });

  describe('wrap', () => {
    it('passes items through when visible', async () => {
      prisma.siteSetting.findUnique.mockResolvedValue({ value: 'true' });
      const result = await service.wrap('testimonials', [{ id: 1 }]);
      expect(result).toEqual({ visible: true, items: [{ id: 1 }] });
    });

    it('empties items when the section is hidden', async () => {
      prisma.siteSetting.findUnique.mockResolvedValue({ value: 'false' });
      const result = await service.wrap('testimonials', [{ id: 1 }]);
      expect(result).toEqual({ visible: false, items: [] });
    });
  });

  describe('update', () => {
    it('upserts the setting row and logs an UPDATE audit entry', async () => {
      prisma.siteSetting.findUnique.mockResolvedValue({ value: 'true' });
      prisma.siteSetting.upsert.mockResolvedValue({});

      await service.update('recruiters', false, admin, 'req-1');

      expect(prisma.siteSetting.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'homepage.visibility.recruiters' },
          update: expect.objectContaining({ value: 'false' }),
        }),
      );
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          module: 'homepage_section_visibility',
          requestId: 'req-1',
        }),
      );
    });
  });
});
