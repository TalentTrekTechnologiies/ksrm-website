import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { RecruitersService } from './recruiters.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit-log/audit-log.service';

describe('RecruitersService', () => {
  let service: RecruitersService;
  let prisma: {
    recruiter: {
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
      recruiter: {
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
        RecruitersService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(RecruitersService);
  });

  describe('findAllPublic', () => {
    it('only returns active, non-deleted rows', async () => {
      prisma.recruiter.findMany.mockResolvedValue([{ id: 1 }]);

      await service.findAllPublic();

      expect(prisma.recruiter.findMany).toHaveBeenCalledWith({
        where: { isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('auto-assigns sortOrder to the current count when not provided', async () => {
      prisma.recruiter.count.mockResolvedValue(2);
      prisma.recruiter.create.mockResolvedValue({ id: 3, sortOrder: 2 });

      await service.create(
        { name: 'Acme Corp', logoUrl: '/logos/acme.png' },
        admin,
        undefined,
      );

      expect(prisma.recruiter.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ sortOrder: 2 }),
      });
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.recruiter.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.recruiter.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes by setting deletedAt/deletedBy and logs DELETE', async () => {
      prisma.recruiter.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.recruiter.update.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
        deletedBy: 1,
      });

      await service.softDelete(1, admin, undefined);

      expect(prisma.recruiter.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          deletedBy: 1,
          version: { increment: 1 },
        }),
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE' }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.recruiter.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('restores by clearing deletedAt/deletedBy and logs RESTORE', async () => {
      prisma.recruiter.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      prisma.recruiter.update.mockResolvedValue({ id: 1, deletedAt: null });

      await service.restore(1, admin, undefined);

      expect(prisma.recruiter.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'RESTORE' }),
      );
    });
  });

  describe('reorder', () => {
    it('rejects duplicate sortOrder values before touching the database', async () => {
      await expect(
        service.reorder(
          {
            items: [
              { id: 1, sortOrder: 0 },
              { id: 2, sortOrder: 0 },
            ],
          },
          admin,
          undefined,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects when an id does not exist', async () => {
      prisma.recruiter.findMany.mockResolvedValueOnce([{ id: 1 }]); // only 1 of 2 ids found

      await expect(
        service.reorder(
          {
            items: [
              { id: 1, sortOrder: 0 },
              { id: 2, sortOrder: 1 },
            ],
          },
          admin,
          undefined,
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('reorders in a single transaction and logs REORDER', async () => {
      prisma.recruiter.findMany
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }]) // existence check
        .mockResolvedValueOnce([{ id: 2 }, { id: 1 }]); // final findAllAdmin
      prisma.$transaction.mockResolvedValue(undefined);

      await service.reorder(
        {
          items: [
            { id: 1, sortOrder: 1 },
            { id: 2, sortOrder: 0 },
          ],
        },
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
