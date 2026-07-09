import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: { auditLog: { findFirst: jest.Mock; findMany: jest.Mock; create: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      auditLog: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditLogService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(AuditLogService);
  });

  describe('getByTarget', () => {
    it('filters by both module and targetId', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);

      await service.getByTarget('homepage_hero', 1);

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: { module: 'homepage_hero', targetId: 1 },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });
  });

  describe('getCreatorAndUpdater', () => {
    it('returns null for both when the record has no audit history', async () => {
      prisma.auditLog.findFirst.mockResolvedValue(null);

      const result = await service.getCreatorAndUpdater('homepage_hero', 1);

      expect(result).toEqual({ createdBy: null, updatedBy: null });
    });

    it('derives createdBy from the earliest CREATE entry and updatedBy from the most recent entry', async () => {
      const createEntry = {
        adminId: 1,
        adminName: 'Alice',
        createdAt: new Date('2026-01-01'),
      };
      const latestEntry = {
        adminId: 2,
        adminName: 'Bob',
        createdAt: new Date('2026-02-01'),
      };
      prisma.auditLog.findFirst
        .mockResolvedValueOnce(createEntry) // CREATE lookup
        .mockResolvedValueOnce(latestEntry); // latest lookup

      const result = await service.getCreatorAndUpdater('homepage_hero', 1);

      expect(result.createdBy).toEqual({
        adminId: 1,
        adminName: 'Alice',
        createdAt: createEntry.createdAt,
      });
      expect(result.updatedBy).toEqual({
        adminId: 2,
        adminName: 'Bob',
        createdAt: latestEntry.createdAt,
      });
    });

    it('falls back updatedBy to the CREATE entry itself when nothing has happened since', async () => {
      const createEntry = { adminId: 1, adminName: 'Alice', createdAt: new Date('2026-01-01') };
      prisma.auditLog.findFirst.mockResolvedValueOnce(createEntry).mockResolvedValueOnce(createEntry);

      const result = await service.getCreatorAndUpdater('homepage_hero', 1);

      expect(result.updatedBy).toEqual({ adminId: 1, adminName: 'Alice', createdAt: createEntry.createdAt });
    });
  });
});
