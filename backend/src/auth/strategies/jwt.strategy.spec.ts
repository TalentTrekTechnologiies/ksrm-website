import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';
import { EffectivePermissionsService } from '../effective-permissions.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prisma: { admin: { findUnique: jest.Mock } };
  let effectivePermissions: { getEffectivePermissions: jest.Mock };

  beforeEach(async () => {
    prisma = { admin: { findUnique: jest.fn() } };
    effectivePermissions = { getEffectivePermissions: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: PrismaService, useValue: prisma },
        { provide: EffectivePermissionsService, useValue: effectivePermissions },
        { provide: ConfigService, useValue: { get: () => 'test-secret' } },
      ],
    }).compile();

    strategy = module.get(JwtStrategy);
  });

  it('rejects a deactivated or missing admin', async () => {
    prisma.admin.findUnique.mockResolvedValue(null);

    await expect(strategy.validate({ sub: 1, email: 'x@y.com' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects a soft-deleted admin even if isActive is still true', async () => {
    prisma.admin.findUnique.mockResolvedValue({
      id: 3,
      email: 'gone@ksrm.edu',
      name: 'Gone',
      isSuperAdmin: false,
      permissions: [],
      department: null,
      isActive: true,
      deletedAt: new Date(),
    });

    await expect(strategy.validate({ sub: 3, email: 'gone@ksrm.edu' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  // This is the regression test for the RBAC bug: req.user.permissions must
  // reflect the AdminRole -> Role -> RolePermission resolution, NOT the
  // legacy Admin.permissions column (which is never populated for
  // role-based grants and would silently deny every role-assigned admin).
  it('attaches role-resolved permissions, not the legacy Admin.permissions column', async () => {
    prisma.admin.findUnique.mockResolvedValue({
      id: 2,
      email: 'editor@ksrm.edu',
      name: 'Editor',
      isSuperAdmin: false,
      permissions: [], // legacy column - always empty for role-based admins
      department: null,
      isActive: true,
    });
    effectivePermissions.getEffectivePermissions.mockResolvedValue(
      new Set(['homepage.view', 'homepage.edit']),
    );

    const result = await strategy.validate({ sub: 2, email: 'editor@ksrm.edu' });

    expect(result.permissions).toEqual(
      expect.arrayContaining(['homepage.view', 'homepage.edit']),
    );
    expect(effectivePermissions.getEffectivePermissions).toHaveBeenCalledWith(
      expect.objectContaining({ id: 2, isSuperAdmin: false }),
    );
  });

  it('does not leak isActive onto the attached user object', async () => {
    prisma.admin.findUnique.mockResolvedValue({
      id: 1,
      email: 'a@b.com',
      name: 'A',
      isSuperAdmin: true,
      permissions: [],
      department: null,
      isActive: true,
    });
    effectivePermissions.getEffectivePermissions.mockResolvedValue(new Set());

    const result = await strategy.validate({ sub: 1, email: 'a@b.com' });

    expect(result).not.toHaveProperty('isActive');
    expect(result).not.toHaveProperty('deletedAt');
  });
});
