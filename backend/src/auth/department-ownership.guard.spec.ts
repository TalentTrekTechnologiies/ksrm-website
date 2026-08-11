import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DepartmentOwnershipGuard } from './department-ownership.guard';
import { PrismaService } from '../prisma/prisma.service';

function makeContext(user: unknown, body: unknown, params: Record<string, string>) {
  return {
    getHandler: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user, body, params }),
    }),
  } as unknown as ExecutionContext;
}

describe('DepartmentOwnershipGuard', () => {
  let guard: DepartmentOwnershipGuard;
  let reflector: { get: jest.Mock };
  let prisma: { faculty: { findUnique: jest.Mock } };

  beforeEach(async () => {
    reflector = { get: jest.fn() };
    prisma = { faculty: { findUnique: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentOwnershipGuard,
        { provide: Reflector, useValue: reflector },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    guard = module.get(DepartmentOwnershipGuard);
  });

  it('allows through when the endpoint has no @DepartmentScoped metadata', async () => {
    reflector.get.mockReturnValue(undefined);
    const ctx = makeContext({ departmentId: 5 }, {}, {});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('always allows a super admin, regardless of the target department', async () => {
    reflector.get.mockReturnValue({ source: 'body' });
    const ctx = makeContext({ isSuperAdmin: true, departmentId: 5 }, { departmentId: 99 }, {});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('always allows an admin with no departmentId set (unscoped)', async () => {
    reflector.get.mockReturnValue({ source: 'body' });
    const ctx = makeContext({ isSuperAdmin: false, departmentId: null }, { departmentId: 99 }, {});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('(source: body) allows a scoped admin creating a record in their own department', async () => {
    reflector.get.mockReturnValue({ source: 'body' });
    const ctx = makeContext({ isSuperAdmin: false, departmentId: 5 }, { departmentId: 5 }, {});
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('(source: body) 403s a scoped admin creating a record in a DIFFERENT department', async () => {
    reflector.get.mockReturnValue({ source: 'body' });
    const ctx = makeContext({ isSuperAdmin: false, departmentId: 5 }, { departmentId: 6 }, {});
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('(source: self) allows a scoped admin editing their own Department entity', async () => {
    reflector.get.mockReturnValue({ source: 'self' });
    const ctx = makeContext({ isSuperAdmin: false, departmentId: 5 }, {}, { id: '5' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('(source: self) 403s a scoped admin editing a DIFFERENT Department entity', async () => {
    reflector.get.mockReturnValue({ source: 'self' });
    const ctx = makeContext({ isSuperAdmin: false, departmentId: 5 }, {}, { id: '6' });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('(source: lookup) resolves the existing record\'s departmentId and allows a match', async () => {
    reflector.get.mockReturnValue({ source: 'lookup', model: 'faculty' });
    prisma.faculty.findUnique.mockResolvedValue({ departmentId: 5 });
    const ctx = makeContext({ isSuperAdmin: false, departmentId: 5 }, {}, { id: '42' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(prisma.faculty.findUnique).toHaveBeenCalledWith({
      where: { id: 42 },
      select: { departmentId: true },
    });
  });

  it('(source: lookup) 403s when the existing record belongs to a different department', async () => {
    reflector.get.mockReturnValue({ source: 'lookup', model: 'faculty' });
    prisma.faculty.findUnique.mockResolvedValue({ departmentId: 6 });
    const ctx = makeContext({ isSuperAdmin: false, departmentId: 5 }, {}, { id: '42' });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  // Reversed deliberately. An unassigned row is college-wide content (exam
  // documents, the general gallery), which belongs to a Super Admin or to a
  // college-wide role - not to whichever department admin reaches it first.
  it('(source: lookup) 403s a scoped admin on an unassigned (departmentId: null) record', async () => {
    reflector.get.mockReturnValue({ source: 'lookup', model: 'faculty' });
    prisma.faculty.findUnique.mockResolvedValue({ departmentId: null });
    const ctx = makeContext({ isSuperAdmin: false, departmentId: 5 }, {}, { id: '42' });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('still lets an unscoped (departmentId: null) admin manage unassigned records', async () => {
    reflector.get.mockReturnValue({ source: 'lookup', model: 'faculty' });
    prisma.faculty.findUnique.mockResolvedValue({ departmentId: null });
    const ctx = makeContext({ isSuperAdmin: false, departmentId: null }, {}, { id: '42' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  // The escape the guard previously missed: it authorized against the stored
  // row only, so a body carrying a different departmentId moved the record
  // out of the admin's own department.
  it('(source: lookup) 403s an update that reassigns its own record to another department', async () => {
    reflector.get.mockReturnValue({ source: 'lookup', model: 'faculty' });
    prisma.faculty.findUnique.mockResolvedValue({ departmentId: 5 });
    const ctx = makeContext(
      { isSuperAdmin: false, departmentId: 5 },
      { departmentId: 6 },
      { id: '42' },
    );
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('(source: lookup) allows an update that repeats its own departmentId unchanged', async () => {
    reflector.get.mockReturnValue({ source: 'lookup', model: 'faculty' });
    prisma.faculty.findUnique.mockResolvedValue({ departmentId: 5 });
    const ctx = makeContext(
      { isSuperAdmin: false, departmentId: 5 },
      { departmentId: 5 },
      { id: '42' },
    );
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
