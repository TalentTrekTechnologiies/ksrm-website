import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';

describe('AdminsService', () => {
  let service: AdminsService;
  let prisma: {
    admin: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    role: { findMany: jest.Mock };
    adminRole: { findMany: jest.Mock; deleteMany: jest.Mock; create: jest.Mock };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };

  const superAdmin = { id: 1, name: 'Super', email: 'super@ksrm.edu', isSuperAdmin: true };
  const regularActor = { id: 2, name: 'Editor', email: 'editor@ksrm.edu', isSuperAdmin: false };

  beforeEach(async () => {
    prisma = {
      admin: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      role: { findMany: jest.fn() },
      adminRole: { findMany: jest.fn(), deleteMany: jest.fn(), create: jest.fn() },
      $transaction: jest.fn(),
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };
    const adminNotifications = { notifyByPermission: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: AdminNotificationsService, useValue: adminNotifications },
      ],
    }).compile();

    service = module.get(AdminsService);
  });

  describe('findAll', () => {
    it('defaults to active status (not deleted, isActive true) and paginates', async () => {
      prisma.admin.findMany.mockResolvedValue([]);
      prisma.admin.count.mockResolvedValue(0);

      await service.findAll({});

      expect(prisma.admin.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null, isActive: true },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('applies search across name/email and a custom page/pageSize', async () => {
      prisma.admin.findMany.mockResolvedValue([]);
      prisma.admin.count.mockResolvedValue(0);

      await service.findAll({ search: 'jane', page: 2, pageSize: 5 });

      expect(prisma.admin.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'jane', mode: 'insensitive' } },
              { email: { contains: 'jane', mode: 'insensitive' } },
            ],
          }),
          skip: 5,
          take: 5,
        }),
      );
    });

    it('status "deleted" filters to soft-deleted rows only', async () => {
      prisma.admin.findMany.mockResolvedValue([]);
      prisma.admin.count.mockResolvedValue(0);

      await service.findAll({ status: 'deleted' });

      expect(prisma.admin.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { NOT: { deletedAt: null } } }),
      );
    });
  });

  describe('create', () => {
    it('hashes the password and never persists it in the returned/audited shape', async () => {
      prisma.admin.create.mockResolvedValue({
        id: 5,
        email: 'new@ksrm.edu',
        name: 'New Admin',
        roles: [],
      });

      const result = await service.create(
        { email: 'new@ksrm.edu', password: 'password123', name: 'New Admin' } as any,
        superAdmin,
        undefined,
      );

      expect(prisma.admin.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            password: expect.not.stringMatching('password123'),
          }),
        }),
      );
      expect(result).not.toHaveProperty('password');
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', module: 'admins' }),
      );
    });

    it('rejects creating a super admin unless the actor is a real super admin', async () => {
      await expect(
        service.create(
          { email: 'x@y.com', password: 'password123', name: 'X', isSuperAdmin: true } as any,
          regularActor,
          undefined,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.admin.create).not.toHaveBeenCalled();
    });

    it('rejects assigning the Super Admin role unless the actor is a real super admin', async () => {
      prisma.role.findMany.mockResolvedValue([{ id: 9, name: 'Super Admin' }]);

      await expect(
        service.create(
          { email: 'x@y.com', password: 'password123', name: 'X', roleIds: [9] } as any,
          regularActor,
          undefined,
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('409s on duplicate email', async () => {
      const { Prisma } = require('@prisma/client');
      const err = new Prisma.PrismaClientKnownRequestError('unique violation', {
        code: 'P2002',
        clientVersion: '5.0.0',
      });
      prisma.admin.create.mockRejectedValue(err);

      await expect(
        service.create(
          { email: 'dup@ksrm.edu', password: 'password123', name: 'Dup' } as any,
          superAdmin,
          undefined,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.admin.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { name: 'x', version: 1 } as any, superAdmin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the admin does not exist or is soft-deleted', async () => {
      prisma.admin.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { name: 'x', version: 1 } as any, superAdmin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('setStatus', () => {
    it('rejects disabling your own account', async () => {
      await expect(
        service.setStatus(2, false, regularActor, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.admin.update).not.toHaveBeenCalled();
    });

    it('rejects disabling the last remaining active super admin', async () => {
      prisma.admin.findFirst.mockResolvedValue({ id: 5, isSuperAdmin: true, isActive: true });
      prisma.admin.count.mockResolvedValue(1);

      await expect(
        service.setStatus(5, false, superAdmin, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('allows disabling a super admin when another active super admin exists', async () => {
      prisma.admin.findFirst.mockResolvedValue({ id: 5, isSuperAdmin: true, isActive: true });
      prisma.admin.count.mockResolvedValue(2);
      prisma.admin.update.mockResolvedValue({ id: 5, isActive: false, roles: [] });

      await service.setStatus(5, false, superAdmin, undefined);

      expect(prisma.admin.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ isActive: false }) }),
      );
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DISABLE' }),
      );
    });
  });

  describe('resetPassword', () => {
    it('updates the password hash and logs RESET_PASSWORD without recording the password', async () => {
      prisma.admin.findFirst.mockResolvedValue({ id: 5 });
      prisma.admin.update.mockResolvedValue({ id: 5 });

      await service.resetPassword(5, { newPassword: 'newpassword123' }, superAdmin, undefined);

      expect(prisma.admin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ password: expect.not.stringMatching('newpassword123') }),
        }),
      );
      const auditCall = auditLog.log.mock.calls[0][0];
      expect(auditCall.action).toBe('RESET_PASSWORD');
      expect(JSON.stringify(auditCall.details)).not.toContain('newpassword123');
    });
  });

  describe('assignRoles', () => {
    it('rejects assigning the Super Admin role unless the actor is a real super admin', async () => {
      prisma.admin.findFirst.mockResolvedValue({ id: 5 });
      prisma.role.findMany.mockResolvedValue([{ id: 9, name: 'Super Admin' }]);

      await expect(
        service.assignRoles(5, { roleIds: [9] }, regularActor, undefined),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('rejects unknown role ids', async () => {
      prisma.admin.findFirst.mockResolvedValue({ id: 5 });
      prisma.role.findMany.mockResolvedValue([]);

      await expect(
        service.assignRoles(5, { roleIds: [999] }, superAdmin, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('replaces roles in a transaction and logs ASSIGN_ROLES', async () => {
      prisma.admin.findFirst.mockResolvedValue({ id: 5 }); // findActiveOrThrow
      prisma.role.findMany.mockResolvedValue([{ id: 3, name: 'Content Editor' }]);
      prisma.adminRole.findMany.mockResolvedValue([]);
      prisma.$transaction.mockResolvedValue(undefined);
      prisma.admin.findUnique.mockResolvedValue({ id: 5, roles: [] }); // findOne() at the end

      await service.assignRoles(5, { roleIds: [3] }, superAdmin, undefined);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'ASSIGN_ROLES', module: 'admins' }),
      );
    });
  });

  describe('softDelete', () => {
    it('rejects deleting your own account', async () => {
      await expect(service.softDelete(2, regularActor, undefined)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects deleting the last remaining super admin', async () => {
      prisma.admin.findFirst.mockResolvedValue({ id: 5, isSuperAdmin: true });
      prisma.admin.count.mockResolvedValue(1);

      await expect(service.softDelete(5, superAdmin, undefined)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('soft-deletes and logs DELETE', async () => {
      prisma.admin.findFirst.mockResolvedValue({ id: 5, isSuperAdmin: false });
      prisma.admin.update.mockResolvedValue({ id: 5, deletedAt: new Date(), roles: [] });

      await service.softDelete(5, superAdmin, undefined);

      expect(prisma.admin.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedBy: superAdmin.id }),
        }),
      );
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'admins' }),
      );
    });
  });

  describe('restore', () => {
    it('404s restoring an admin that is not actually deleted', async () => {
      prisma.admin.findFirst.mockResolvedValue(null);

      await expect(service.restore(5, superAdmin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('restores and logs RESTORE', async () => {
      prisma.admin.findFirst.mockResolvedValue({ id: 5, deletedAt: new Date() });
      prisma.admin.update.mockResolvedValue({ id: 5, deletedAt: null, roles: [] });

      await service.restore(5, superAdmin, undefined);

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'RESTORE' }),
      );
    });
  });
});
