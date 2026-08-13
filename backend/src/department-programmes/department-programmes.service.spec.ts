import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DepartmentProgrammesService } from './department-programmes.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('DepartmentProgrammesService', () => {
  let service: DepartmentProgrammesService;
  let prisma: {
    departmentProgramme: {
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
      departmentProgramme: {
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
        DepartmentProgrammesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(DepartmentProgrammesService);
  });

  describe('findAllPublic', () => {
    it('scopes to one department, active + non-deleted only', async () => {
      prisma.departmentProgramme.findMany.mockResolvedValue([]);

      await service.findAllPublic(3);

      expect(prisma.departmentProgramme.findMany).toHaveBeenCalledWith({
        where: { departmentId: 3, isActive: true, deletedAt: null },
        include: {
          department: { select: { name: true, shortName: true, slug: true } },
        },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.departmentProgramme.findFirst.mockResolvedValue({
        id: 1,
        version: 2,
      });

      await expect(
        service.update(1, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.departmentProgramme.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and logs DELETE', async () => {
      prisma.departmentProgramme.findFirst.mockResolvedValue({
        id: 1,
        version: 1,
      });
      prisma.departmentProgramme.update.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });

      await service.softDelete(1, admin, undefined);

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          module: 'department_programmes',
        }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.departmentProgramme.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('restores and logs RESTORE', async () => {
      prisma.departmentProgramme.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      prisma.departmentProgramme.update.mockResolvedValue({
        id: 1,
        deletedAt: null,
      });

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

    it('reorders in a single transaction and logs REORDER', async () => {
      prisma.departmentProgramme.findMany
        .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
        .mockResolvedValueOnce([{ id: 2 }, { id: 1 }]);
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
