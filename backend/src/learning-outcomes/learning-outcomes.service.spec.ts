import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { LearningOutcomesService } from './learning-outcomes.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('LearningOutcomesService', () => {
  let service: LearningOutcomesService;
  let prisma: {
    learningOutcome: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      learningOutcome: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearningOutcomesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(LearningOutcomesService);
  });

  describe('findAllPublic', () => {
    it('scopes to one department and orders by type then sortOrder', async () => {
      prisma.learningOutcome.findMany.mockResolvedValue([]);

      await service.findAllPublic(3);

      expect(prisma.learningOutcome.findMany).toHaveBeenCalledWith({
        where: { departmentId: 3, deletedAt: null },
        orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
      });
    });

    it('filters by type when provided (e.g. only PEOs)', async () => {
      prisma.learningOutcome.findMany.mockResolvedValue([]);

      await service.findAllPublic(3, 'PEO' as any);

      expect(prisma.learningOutcome.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ type: 'PEO' }) }),
      );
    });
  });

  describe('create', () => {
    it('auto-assigns sortOrder scoped to department+type independently', async () => {
      prisma.learningOutcome.count.mockResolvedValue(1);
      prisma.learningOutcome.create.mockResolvedValue({ id: 5, sortOrder: 1 });

      await service.create(
        { departmentId: 3, type: 'PO', code: 'PO1', text: 'text' } as any,
        admin,
        undefined,
      );

      expect(prisma.learningOutcome.count).toHaveBeenCalledWith({
        where: { departmentId: 3, type: 'PO', deletedAt: null },
      });
    });

    it('409s on duplicate (departmentId, type, code)', async () => {
      const { Prisma } = require('@prisma/client');
      prisma.learningOutcome.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('unique violation', {
          code: 'P2002',
          clientVersion: '5.0.0',
        }),
      );

      await expect(
        service.create(
          { departmentId: 3, type: 'PO', code: 'PO1', text: 'text' } as any,
          admin,
          undefined,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.learningOutcome.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { text: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.learningOutcome.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { text: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and logs DELETE', async () => {
      prisma.learningOutcome.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.learningOutcome.update.mockResolvedValue({ id: 1, deletedAt: new Date() });

      await service.softDelete(1, admin, undefined);

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'learning_outcomes' }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.learningOutcome.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('restores and logs RESTORE', async () => {
      prisma.learningOutcome.findFirst.mockResolvedValue({ id: 1, deletedAt: new Date() });
      prisma.learningOutcome.update.mockResolvedValue({ id: 1, deletedAt: null });

      await service.restore(1, admin, undefined);

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'RESTORE' }),
      );
    });
  });

  describe('reorder', () => {
    it('rejects duplicate sortOrder values before touching the database', async () => {
      await expect(
        service.reorder(
          { items: [{ id: 1, sortOrder: 0 }, { id: 2, sortOrder: 0 }] },
          admin,
          undefined,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('reorders in a single transaction and logs REORDER', async () => {
      prisma.learningOutcome.findMany
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
        .mockResolvedValueOnce([{ id: 2 }, { id: 1 }]);
      prisma.$transaction.mockResolvedValue(undefined);

      await service.reorder(
        { items: [{ id: 1, sortOrder: 1 }, { id: 2, sortOrder: 0 }] },
        admin,
        'req-3',
      );

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'REORDER', requestId: 'req-3' }),
      );
    });
  });
});
