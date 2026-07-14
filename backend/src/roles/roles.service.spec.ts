import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('RolesService', () => {
  let service: RolesService;
  let prisma: {
    role: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    permission: { findMany: jest.Mock };
    adminRole: { count: jest.Mock };
  };
  let auditLog: { log: jest.Mock };

  const superAdmin = { id: 1, name: 'Super', email: 'super@ksrm.edu', isSuperAdmin: true };
  const regularActor = { id: 2, name: 'Editor', email: 'editor@ksrm.edu', isSuperAdmin: false };

  beforeEach(async () => {
    prisma = {
      role: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      permission: { findMany: jest.fn() },
      adminRole: { count: jest.fn() },
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(RolesService);
  });

  describe('findAll', () => {
    it('flattens permission keys and admin counts', async () => {
      prisma.role.findMany.mockResolvedValue([
        {
          id: 1,
          name: 'Content Editor',
          description: null,
          isSystemRole: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          permissions: [{ permission: { key: 'news.view' } }, { permission: { key: 'news.update' } }],
          _count: { admins: 3 },
        },
      ]);

      const result = await service.findAll();

      expect(result[0]).toMatchObject({
        id: 1,
        name: 'Content Editor',
        adminCount: 3,
        permissionKeys: ['news.view', 'news.update'],
      });
    });
  });

  describe('create', () => {
    it('rejects a non-super-admin actor', async () => {
      await expect(
        service.create({ name: 'X', permissionKeys: [] }, regularActor, undefined),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.role.create).not.toHaveBeenCalled();
    });

    it('rejects unknown permission keys', async () => {
      prisma.permission.findMany.mockResolvedValue([]);

      await expect(
        service.create({ name: 'X', permissionKeys: ['bogus.key'] }, superAdmin, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates a non-system role and logs CREATE', async () => {
      prisma.permission.findMany.mockResolvedValue([{ id: 10, key: 'news.view' }]);
      prisma.role.create.mockResolvedValue({ id: 20, name: 'Custom', isSystemRole: false });

      await service.create({ name: 'Custom', permissionKeys: ['news.view'] }, superAdmin, undefined);

      expect(prisma.role.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ isSystemRole: false }),
        }),
      );
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', module: 'roles' }),
      );
    });

    it('409s on duplicate role name', async () => {
      prisma.permission.findMany.mockResolvedValue([]);
      const { Prisma } = require('@prisma/client');
      prisma.role.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('unique violation', {
          code: 'P2002',
          clientVersion: '5.0.0',
        }),
      );

      await expect(
        service.create({ name: 'Dup', permissionKeys: [] }, superAdmin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('update', () => {
    it('rejects a non-super-admin actor', async () => {
      await expect(
        service.update(1, { name: 'x' }, regularActor, undefined),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('404s when the role does not exist', async () => {
      prisma.role.findUnique.mockResolvedValue(null);

      await expect(
        service.update(99, { name: 'x' }, superAdmin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects editing a system role', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 1, isSystemRole: true });

      await expect(
        service.update(1, { name: 'x' }, superAdmin, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('delete', () => {
    it('rejects deleting a system role', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 1, isSystemRole: true });

      await expect(service.delete(1, superAdmin, undefined)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects deleting a role that still has admins assigned', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 2, isSystemRole: false, name: 'Custom' });
      prisma.adminRole.count.mockResolvedValue(2);

      await expect(service.delete(2, superAdmin, undefined)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prisma.role.delete).not.toHaveBeenCalled();
    });

    it('deletes an unused custom role and logs DELETE', async () => {
      prisma.role.findUnique.mockResolvedValue({ id: 2, isSystemRole: false, name: 'Custom' });
      prisma.adminRole.count.mockResolvedValue(0);
      prisma.role.delete.mockResolvedValue({ id: 2 });

      await service.delete(2, superAdmin, undefined);

      expect(prisma.role.delete).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'roles' }),
      );
    });
  });
});
