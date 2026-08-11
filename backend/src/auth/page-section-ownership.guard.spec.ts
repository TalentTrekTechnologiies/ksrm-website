import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  PageSectionOwnershipGuard,
  pageSectionRoot,
} from './page-section-ownership.guard';
import { PrismaService } from '../prisma/prisma.service';

describe('PageSectionOwnershipGuard', () => {
  let guard: PageSectionOwnershipGuard;
  let reflector: { get: jest.Mock };
  let prisma: {
    download: { findUnique: jest.Mock };
    pageText: { findUnique: jest.Mock };
  };

  function makeContext(user: any, body: any = {}, params: any = {}) {
    return {
      switchToHttp: () => ({ getRequest: () => ({ user, body, params }) }),
      getHandler: () => () => undefined,
    } as any;
  }

  beforeEach(async () => {
    reflector = { get: jest.fn() };
    prisma = {
      download: { findUnique: jest.fn() },
      pageText: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PageSectionOwnershipGuard,
        { provide: Reflector, useValue: reflector },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    guard = module.get(PageSectionOwnershipGuard);
  });

  const examAdmin = { isSuperAdmin: false, permissions: ['downloads.update', 'pages.examinations'] };

  it('takes the root before the first dot as the owning page', () => {
    expect(pageSectionRoot('examinations.timetables')).toBe('examinations');
    expect(pageSectionRoot('naac')).toBe('naac');
  });

  it('allows through when the endpoint has no @PageSectionScoped metadata', async () => {
    reflector.get.mockReturnValue(undefined);
    await expect(guard.canActivate(makeContext(examAdmin))).resolves.toBe(true);
  });

  it('always allows a super admin', async () => {
    reflector.get.mockReturnValue({ source: 'body' });
    const ctx = makeContext({ isSuperAdmin: true, permissions: [] }, { pageSection: 'iqac' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  // The property that keeps this backwards-compatible: an admin holding no
  // pages.* key at all is not page-restricted, so existing roles are
  // unaffected by the guard being added to their endpoints.
  it('does not restrict an admin who holds no pages.* permission', async () => {
    reflector.get.mockReturnValue({ source: 'body' });
    const ctx = makeContext(
      { isSuperAdmin: false, permissions: ['downloads.update'] },
      { pageSection: 'iqac' },
    );
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('(source: body) allows creating on an owned page, including a sub-section', async () => {
    reflector.get.mockReturnValue({ source: 'body' });
    const ctx = makeContext(examAdmin, { pageSection: 'examinations.results' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  it('(source: body) 403s creating on somebody else\'s page', async () => {
    reflector.get.mockReturnValue({ source: 'body' });
    const ctx = makeContext(examAdmin, { pageSection: 'iqac.aqar' });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  // Content tied to no page belongs to a Super Admin or an unrestricted role,
  // not to whichever page owner reaches it first - the same rule the
  // department guard applies to departmentId: null.
  it('(source: body) 403s a page-restricted admin on content with no pageSection', async () => {
    reflector.get.mockReturnValue({ source: 'body' });
    await expect(
      guard.canActivate(makeContext(examAdmin, {})),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('(source: lookup) reads the existing row\'s pageSection and allows a match', async () => {
    reflector.get.mockReturnValue({ source: 'lookup', model: 'download' });
    prisma.download.findUnique.mockResolvedValue({ pageSection: 'examinations.timetables' });
    const ctx = makeContext(examAdmin, {}, { id: '7' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(prisma.download.findUnique).toHaveBeenCalledWith({
      where: { id: 7 },
      select: { pageSection: true },
    });
  });

  it('(source: lookup) 403s when the existing row belongs to another page', async () => {
    reflector.get.mockReturnValue({ source: 'lookup', model: 'download' });
    prisma.download.findUnique.mockResolvedValue({ pageSection: 'syllabus' });
    const ctx = makeContext(examAdmin, {}, { id: '7' });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('(source: lookupKey) resolves a string-keyed record', async () => {
    reflector.get.mockReturnValue({ source: 'lookupKey', model: 'pageText' });
    prisma.pageText.findUnique.mockResolvedValue({ pageSection: 'examinations' });
    const ctx = makeContext(examAdmin, {}, { key: 'examinations.intro.p1' });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(prisma.pageText.findUnique).toHaveBeenCalledWith({
      where: { key: 'examinations.intro.p1' },
      select: { pageSection: true },
    });
  });

  it('(source: bodyItems) allows a batch entirely on owned pages', async () => {
    reflector.get.mockReturnValue({ source: 'bodyItems', field: 'items' });
    const ctx = makeContext(examAdmin, {
      items: [
        { pageSection: 'examinations' },
        { pageSection: 'examinations.results' },
      ],
    });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });

  // A partial save would be worse than none, so one foreign item rejects the
  // whole request rather than silently dropping it.
  it('(source: bodyItems) 403s a batch containing one foreign item', async () => {
    reflector.get.mockReturnValue({ source: 'bodyItems', field: 'items' });
    const ctx = makeContext(examAdmin, {
      items: [{ pageSection: 'examinations' }, { pageSection: 'naac' }],
    });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('(source: bodyItems) 403s an empty batch rather than passing it through', async () => {
    reflector.get.mockReturnValue({ source: 'bodyItems', field: 'items' });
    await expect(
      guard.canActivate(makeContext(examAdmin, { items: [] })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
