import { Test, TestingModule } from '@nestjs/testing';
import { PageTextService } from './page-text.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('PageTextService', () => {
  let service: PageTextService;
  let prisma: {
    pageText: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      upsert: jest.Mock;
      delete: jest.Mock;
    };
  };
  let auditLog: { log: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };
  const row = (over: Partial<Record<string, unknown>> = {}) => ({
    id: 7,
    key: 'library.about.p1',
    pageSection: 'library',
    value: 'New wording',
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  });

  beforeEach(async () => {
    prisma = {
      pageText: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        delete: jest.fn(),
      },
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageTextService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get<PageTextService>(PageTextService);
  });

  describe('findAllPublic', () => {
    it('scopes to a page section when given one', async () => {
      prisma.pageText.findMany.mockResolvedValue([]);
      await service.findAllPublic('library');
      expect(prisma.pageText.findMany).toHaveBeenCalledWith({
        where: { pageSection: 'library' },
        orderBy: { key: 'asc' },
      });
    });

    it('returns every override when no section is given', async () => {
      prisma.pageText.findMany.mockResolvedValue([]);
      await service.findAllPublic();
      expect(prisma.pageText.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { key: 'asc' },
      });
    });
  });

  describe('upsert', () => {
    const items = [
      { key: 'library.about.p1', pageSection: 'library', value: 'New wording' },
    ];

    it('creates an override for a slot that has never been edited', async () => {
      prisma.pageText.findUnique.mockResolvedValue(null);
      prisma.pageText.upsert.mockResolvedValue(row());

      await service.upsert({ items }, admin);

      expect(prisma.pageText.upsert).toHaveBeenCalled();
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', module: 'page_text' }),
      );
    });

    it('logs an edit to an existing override as UPDATE, with the old value', async () => {
      prisma.pageText.findUnique.mockResolvedValue(
        row({ value: 'Old wording' }),
      );
      prisma.pageText.upsert.mockResolvedValue(row());

      await service.upsert({ items }, admin);

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          details: expect.objectContaining({
            before: { value: 'Old wording' },
          }),
        }),
      );
    });

    // Saving a page writes every field the editor holds; without this, an
    // unchanged slot would bump its version and add an audit entry on every
    // save, burying the edits that actually happened.
    it('skips writes and audit entries for a value that has not changed', async () => {
      prisma.pageText.findUnique.mockResolvedValue(
        row({ value: 'New wording' }),
      );

      const result = await service.upsert({ items }, admin);

      expect(prisma.pageText.upsert).not.toHaveBeenCalled();
      expect(auditLog.log).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('blanks a slot when given an empty string, rather than treating it as a reset', async () => {
      prisma.pageText.findUnique.mockResolvedValue(
        row({ value: 'Old wording' }),
      );
      prisma.pageText.upsert.mockResolvedValue(row({ value: '' }));

      await service.upsert(
        {
          items: [
            { key: 'library.about.p1', pageSection: 'library', value: '' },
          ],
        },
        admin,
      );

      expect(prisma.pageText.delete).not.toHaveBeenCalled();
      expect(prisma.pageText.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ value: '' }),
        }),
      );
    });
  });

  describe('reset', () => {
    it('deletes the override and records what it held', async () => {
      prisma.pageText.findUnique.mockResolvedValue(
        row({ value: 'Edited wording' }),
      );
      prisma.pageText.delete.mockResolvedValue(row());

      const result = await service.reset('library.about.p1', admin);

      expect(prisma.pageText.delete).toHaveBeenCalledWith({
        where: { key: 'library.about.p1' },
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          details: expect.objectContaining({
            before: { value: 'Edited wording' },
          }),
        }),
      );
      expect(result).toEqual({ key: 'library.about.p1', reset: true });
    });

    // The admin's intent - "this slot should say what the page says" - is
    // already true, so a 404 here would be noise, not information.
    it('is a silent no-op when the slot was never overridden', async () => {
      prisma.pageText.findUnique.mockResolvedValue(null);

      const result = await service.reset('library.about.p1', admin);

      expect(prisma.pageText.delete).not.toHaveBeenCalled();
      expect(auditLog.log).not.toHaveBeenCalled();
      expect(result).toEqual({ key: 'library.about.p1', reset: false });
    });
  });
});
