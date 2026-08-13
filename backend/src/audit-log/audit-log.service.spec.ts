import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: {
    auditLog: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      create: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      auditLog: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 1 }),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get(AuditLogService);
  });

  describe('log', () => {
    it('serializes details to JSON and defaults ipAddress to undefined outside a request context', async () => {
      await service.log({
        adminId: 1,
        adminName: 'Admin',
        adminEmail: 'admin@ksrm.edu',
        action: 'CREATE',
        module: 'news',
        details: { after: { id: 1 } },
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          details: JSON.stringify({ after: { id: 1 } }),
          ipAddress: undefined,
        }),
      });
    });

    it('an explicitly-passed ipAddress wins over the request context', async () => {
      await service.log({
        adminId: 1,
        adminName: 'Admin',
        adminEmail: 'admin@ksrm.edu',
        action: 'CREATE',
        module: 'news',
        ipAddress: '1.2.3.4',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ ipAddress: '1.2.3.4' }),
      });
    });
  });

  describe('getAll', () => {
    it('paginates with defaults (page 1, pageSize 50) and returns total', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);
      prisma.auditLog.count.mockResolvedValue(0);

      const result = await service.getAll();

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 50 }),
      );
      expect(result).toEqual({ items: [], total: 0, page: 1, pageSize: 50 });
    });

    it('applies module/adminId/action/search/date-range filters together', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);
      prisma.auditLog.count.mockResolvedValue(0);
      const from = new Date('2026-01-01');
      const to = new Date('2026-01-31');

      await service.getAll({
        module: 'news',
        adminId: 5,
        action: 'DELETE',
        search: 'jane',
        from,
        to,
        page: 2,
        pageSize: 10,
      });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            module: 'news',
            adminId: 5,
            action: 'DELETE',
            createdAt: { gte: from, lte: to },
          }),
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('exportCsv', () => {
    it('produces a header row plus one row per entry, quoting fields that contain commas', async () => {
      prisma.auditLog.findMany.mockResolvedValue([
        {
          id: 1,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          action: 'UPDATE',
          module: 'news',
          targetId: 9,
          adminId: 2,
          adminName: 'Jane, Doe',
          adminEmail: 'jane@ksrm.edu',
          ipAddress: '1.2.3.4',
          requestId: 'req-1',
        },
      ]);

      const csv = await service.exportCsv();
      const lines = csv.split('\n');

      expect(lines[0]).toBe(
        'id,createdAt,action,module,targetId,adminId,adminName,adminEmail,ipAddress,requestId',
      );
      expect(lines[1]).toContain('"Jane, Doe"');
      expect(lines[1]).toContain('2026-01-01T00:00:00.000Z');
    });

    it('is not paginated - takes up to the 10000-row safety ceiling', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);

      await service.exportCsv({ module: 'news' });

      expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10000 }),
      );
    });
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
      const createEntry = {
        adminId: 1,
        adminName: 'Alice',
        createdAt: new Date('2026-01-01'),
      };
      prisma.auditLog.findFirst
        .mockResolvedValueOnce(createEntry)
        .mockResolvedValueOnce(createEntry);

      const result = await service.getCreatorAndUpdater('homepage_hero', 1);

      expect(result.updatedBy).toEqual({
        adminId: 1,
        adminName: 'Alice',
        createdAt: createEntry.createdAt,
      });
    });
  });
});
