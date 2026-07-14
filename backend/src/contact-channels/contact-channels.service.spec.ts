import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ContactChannelsService } from './contact-channels.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('ContactChannelsService', () => {
  let service: ContactChannelsService;
  let prisma: {
    contactChannel: {
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
      contactChannel: {
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
        ContactChannelsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(ContactChannelsService);
  });

  describe('findAllPublic', () => {
    it('defaults to departmentId null - the global office directory', async () => {
      prisma.contactChannel.findMany.mockResolvedValue([]);

      await service.findAllPublic();

      expect(prisma.contactChannel.findMany).toHaveBeenCalledWith({
        where: { departmentId: null, isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      });
    });

    it('scopes to one department when an id is given', async () => {
      prisma.contactChannel.findMany.mockResolvedValue([]);

      await service.findAllPublic(3);

      expect(prisma.contactChannel.findMany).toHaveBeenCalledWith({
        where: { departmentId: 3, isActive: true, deletedAt: null },
        orderBy: { sortOrder: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('auto-assigns sortOrder scoped to departmentId (null for global rows)', async () => {
      prisma.contactChannel.count.mockResolvedValue(2);
      prisma.contactChannel.create.mockResolvedValue({ id: 5, sortOrder: 2 });

      await service.create({ name: 'Principal Office' } as any, admin, undefined);

      expect(prisma.contactChannel.count).toHaveBeenCalledWith({
        where: { departmentId: null, deletedAt: null },
      });
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.contactChannel.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(Error);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.contactChannel.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { name: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and logs DELETE', async () => {
      prisma.contactChannel.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.contactChannel.update.mockResolvedValue({ id: 1, deletedAt: new Date() });

      await service.softDelete(1, admin, undefined);

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'contact_channels' }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.contactChannel.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
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
  });
});
