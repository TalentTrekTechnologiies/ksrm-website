import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { ProtectedDocsService } from '../protected-docs/protected-docs.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaLinkService } from '../media/media-link.service';

describe('DownloadsService', () => {
  let service: DownloadsService;
  let prisma: {
    download: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      // Added when uploads started going to the TOP of the list: the service
      // takes min(sortOrder) - 1 rather than count(), so a new document is
      // first rather than buried at the bottom.
      aggregate: jest.Mock;
    };
    syllabusRegulation: { findFirst: jest.Mock };
    departmentProgramme: { findMany: jest.Mock };
    media: { findMany: jest.Mock };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };
  let mediaLink: {
    prepareLink: jest.Mock;
    syncUsage: jest.Mock;
    untrackAll: jest.Mock;
  };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      download: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _min: { sortOrder: 0 } }),
        create: jest.fn(),
        update: jest.fn(),
      },
      syllabusRegulation: { findFirst: jest.fn().mockResolvedValue(null) },
      departmentProgramme: { findMany: jest.fn().mockResolvedValue([]) },
      media: { findMany: jest.fn().mockResolvedValue([]) },
      $transaction: jest.fn(),
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };
    mediaLink = {
      prepareLink: jest
        .fn()
        .mockImplementation((mediaId: number | null | undefined) =>
          mediaId === undefined || mediaId === null
            ? Promise.resolve(undefined)
            : Promise.resolve(
                'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
              ),
        ),
      syncUsage: jest.fn().mockResolvedValue(undefined),
      untrackAll: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DownloadsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaLinkService, useValue: mediaLink },
        { provide: ProtectedDocsService, useValue: { prewarm: jest.fn() } },
      ],
    }).compile();

    service = module.get(DownloadsService);
  });

  describe('findAllPublic - protected documents', () => {
    const rows = [
      { id: 1, pageSection: 'nba', fileUrl: '/api/media/file/7/ORIGINAL/SOURCE', mediaId: 7 },
      { id: 2, pageSection: 'nba.minutes', fileUrl: '/api/media/file/8/ORIGINAL/SOURCE', mediaId: 8 },
      { id: 3, pageSection: 'nba-certificates', fileUrl: '/api/media/file/9/ORIGINAL/SOURCE', mediaId: 9 },
      { id: 4, pageSection: null, fileUrl: '/api/media/file/10/ORIGINAL/SOURCE', mediaId: 10 },
    ];

    it('lists a protected document on its own page without its file link', async () => {
      prisma.download.findMany.mockResolvedValue([rows[0]]);

      const result = await service.findAllPublic(undefined, undefined, 'nba');

      expect(result).toEqual([{ ...rows[0], fileUrl: '', mediaId: null }]);
    });

    it('leaves protected documents out of every other public list', async () => {
      prisma.download.findMany.mockResolvedValue(rows);

      const result = await service.findAllPublic();

      expect(result.map((r) => r.id)).toEqual([3, 4]);
    });

    it('publishes NBA certificates openly, file link included', async () => {
      prisma.download.findMany.mockResolvedValue([rows[2]]);

      const result = await service.findAllPublic(undefined, undefined, 'nba-certificates');

      expect(result).toEqual([rows[2]]);
    });
  });

  describe('one-document sections (the NAAC certificate)', () => {
    const cert = {
      title: 'NAAC Certificate of Accreditation',
      category: 'OTHER',
      pageSection: 'naac.certificate',
      fileUrl: '/x.pdf',
    } as any;

    it('accepts the first certificate', async () => {
      prisma.download.findFirst.mockResolvedValue(null);
      prisma.download.create.mockResolvedValue({ id: 5 });

      await expect(service.create(cert, admin)).resolves.toEqual({ id: 5 });
    });

    it('refuses a second certificate', async () => {
      prisma.download.findFirst.mockResolvedValue({ id: 4 });

      await expect(service.create(cert, admin)).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.download.create).not.toHaveBeenCalled();
    });

    it('refuses a bulk upload of several files into the slot', async () => {
      prisma.download.findFirst.mockResolvedValue(null);

      await expect(
        service.bulkCreate(
          {
            category: 'OTHER',
            pageSection: 'naac.certificate',
            items: [
              { title: 'a', fileUrl: '/a.pdf' },
              { title: 'b', fileUrl: '/b.pdf' },
            ],
          } as any,
          admin,
        ),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.download.create).not.toHaveBeenCalled();
    });

    it('lets the existing certificate have its file replaced', async () => {
      prisma.download.findFirst.mockResolvedValue({ id: 4, version: 1, pageSection: 'naac.certificate' });
      prisma.download.update.mockResolvedValue({ id: 4 });

      await service.update(4, { version: 1, mediaId: 12 } as any, admin);

      // One lookup for the row itself; no slot check, since it is not moving.
      expect(prisma.download.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.download.update).toHaveBeenCalled();
    });

    it('refuses moving another document into an occupied slot', async () => {
      prisma.download.findFirst
        .mockResolvedValueOnce({ id: 7, version: 1, pageSection: 'naac' })
        .mockResolvedValueOnce({ id: 4 });

      await expect(
        service.update(7, { version: 1, pageSection: 'naac.certificate' } as any, admin),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.download.update).not.toHaveBeenCalled();
    });

    it('refuses restoring a deleted certificate while another is in the slot', async () => {
      prisma.download.findFirst
        .mockResolvedValueOnce({ id: 3, pageSection: 'naac.certificate', deletedAt: new Date() })
        .mockResolvedValueOnce({ id: 4 });

      await expect(service.restore(3, admin)).rejects.toBeInstanceOf(ConflictException);
      expect(prisma.download.update).not.toHaveBeenCalled();
    });

    it('leaves every other section unlimited', async () => {
      prisma.download.create.mockResolvedValue({ id: 6 });

      await service.create({ ...cert, pageSection: 'naac' }, admin);

      expect(prisma.download.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('409s on stale version', async () => {
      prisma.download.findFirst.mockResolvedValue({ id: 1, version: 2 });

      await expect(
        service.update(1, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('404s when the row does not exist or is already soft-deleted', async () => {
      prisma.download.findFirst.mockResolvedValue(null);

      await expect(
        service.update(99, { title: 'x', version: 1 } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('softDelete / restore', () => {
    it('soft-deletes and untracks Media usage', async () => {
      prisma.download.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.download.update.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
        deletedBy: 1,
      });

      await service.softDelete(1, admin, undefined);

      expect(mediaLink.untrackAll).toHaveBeenCalledWith('downloads', 1);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'downloads' }),
      );
    });

    it('404s restoring a row that is not actually deleted', async () => {
      prisma.download.findFirst.mockResolvedValue(null);

      await expect(service.restore(1, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('re-tracks Media usage on restore when the row still has a mediaId', async () => {
      prisma.download.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      prisma.download.update.mockResolvedValue({
        id: 1,
        deletedAt: null,
        mediaId: 9,
      });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'downloads',
        1,
        'fileUrl',
        9,
      );
    });

    it('does not re-track on restore when the row has no mediaId', async () => {
      prisma.download.findFirst.mockResolvedValue({
        id: 1,
        deletedAt: new Date(),
      });
      prisma.download.update.mockResolvedValue({
        id: 1,
        deletedAt: null,
        mediaId: null,
      });

      await service.restore(1, admin, undefined);

      expect(mediaLink.syncUsage).not.toHaveBeenCalled();
    });
  });

  describe('Media Library linking', () => {
    it('on create, resolves fileUrl from mediaId (DOCUMENT type) and tracks usage', async () => {
      prisma.download.count.mockResolvedValue(0);
      prisma.download.create.mockResolvedValue({ id: 5 });

      await service.create(
        {
          title: 'Syllabus',
          category: 'SYLLABUS',
          fileUrl: '/fallback.pdf',
          mediaId: 9,
        } as any,
        admin,
        undefined,
      );

      expect(mediaLink.prepareLink).toHaveBeenCalledWith(9, 'DOCUMENT');
      expect(prisma.download.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          fileUrl: 'http://localhost:4000/media/file/9/ORIGINAL/SOURCE',
        }),
      });
      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'downloads',
        5,
        'fileUrl',
        9,
      );
    });

    it('on create, starts the protected-page render so the first reader does not wait', async () => {
      prisma.download.count.mockResolvedValue(0);
      prisma.download.create.mockResolvedValue({ id: 5 });
      const { prewarm } = (
        service as unknown as { protectedDocs: { prewarm: jest.Mock } }
      ).protectedDocs;

      await service.create(
        { title: 'SAR', category: 'OTHER', fileUrl: '/x.pdf', mediaId: 9 } as any,
        admin,
        undefined,
      );

      // Every upload, not only NBA ones: the service decides what it serves
      // and ignores the rest, so the section rule lives in one place.
      expect(prewarm).toHaveBeenCalledWith(5);
    });

    it('on update with mediaId: null, unlinks without touching fileUrl', async () => {
      prisma.download.findFirst.mockResolvedValue({
        id: 1,
        version: 1,
        fileUrl: '/existing.pdf',
      });
      prisma.download.update.mockResolvedValue({ id: 1, version: 2 });

      await service.update(1, { mediaId: null, version: 1 }, admin, undefined);

      expect(mediaLink.syncUsage).toHaveBeenCalledWith(
        'downloads',
        1,
        'fileUrl',
        null,
      );
      expect(prisma.download.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.not.objectContaining({ fileUrl: expect.anything() }),
        }),
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

    // Reorder takes an arbitrary list of ids, so neither ownership guard can
    // cover it - both authorize a single target per request. Without the
    // service-level check these were the one write path a scoped admin could
    // use to touch another department's or another page's records.
    const payload = {
      items: [
        { id: 1, sortOrder: 0 },
        { id: 2, sortOrder: 1 },
      ],
    };
    const deptAdmin = { ...admin, isSuperAdmin: false, departmentId: 5 };
    const examAdmin = {
      ...admin,
      isSuperAdmin: false,
      permissions: ['downloads.update', 'pages.examinations'],
    };

    it('lets a department admin reorder rows that are all their own', async () => {
      prisma.download.findMany.mockResolvedValue([
        { id: 1, departmentId: 5, pageSection: null },
        { id: 2, departmentId: 5, pageSection: null },
      ]);
      await expect(
        service.reorder(payload, deptAdmin, undefined),
      ).resolves.toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it("403s a department admin reordering another department's rows", async () => {
      prisma.download.findMany.mockResolvedValue([
        { id: 1, departmentId: 5, pageSection: null },
        { id: 2, departmentId: 6, pageSection: null },
      ]);
      await expect(
        service.reorder(payload, deptAdmin, undefined),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('403s a department admin reordering unowned/global rows', async () => {
      prisma.download.findMany.mockResolvedValue([
        { id: 1, departmentId: null, pageSection: 'examinations.results' },
        { id: 2, departmentId: null, pageSection: 'examinations.results' },
      ]);
      await expect(
        service.reorder(payload, deptAdmin, undefined),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('lets a page-scoped admin reorder rows on their own page', async () => {
      prisma.download.findMany.mockResolvedValue([
        { id: 1, departmentId: null, pageSection: 'examinations' },
        { id: 2, departmentId: null, pageSection: 'examinations.timetables' },
      ]);
      await expect(
        service.reorder(payload, examAdmin, undefined),
      ).resolves.toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('403s a page-scoped admin when one row belongs to another page', async () => {
      prisma.download.findMany.mockResolvedValue([
        { id: 1, departmentId: null, pageSection: 'examinations' },
        { id: 2, departmentId: null, pageSection: 'naac' },
      ]);
      await expect(
        service.reorder(payload, examAdmin, undefined),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('never restricts a super admin', async () => {
      prisma.download.findMany.mockResolvedValue([
        { id: 1, departmentId: 6, pageSection: 'naac' },
        { id: 2, departmentId: null, pageSection: null },
      ]);
      await expect(
        service.reorder(
          payload,
          { ...admin, isSuperAdmin: true, departmentId: 5 },
          undefined,
        ),
      ).resolves.toBeDefined();
      expect(prisma.$transaction).toHaveBeenCalled();
    });
  });

  /**
   * A syllabus filed against a regulation or branch that does not exist never
   * appears on the page, and nothing anywhere says why. These make it an error
   * at the point the wrong value is sent, rather than a syllabus that is
   * quietly missing until somebody goes looking for it.
   */
  describe('syllabus filing', () => {
    const withBranches = {
      id: 7,
      code: 'R23',
      deletedAt: null,
      programme: { id: 1, name: 'B.Tech (UG)', level: 'UG', nameContains: null },
    };

    function baseDto(extra: Record<string, unknown> = {}) {
      return {
        title: 'I & II Semester',
        category: 'SYLLABUS',
        fileUrl: '/f.pdf',
        ...extra,
      } as never;
    }

    it('rejects a regulation that does not exist', async () => {
      prisma.syllabusRegulation.findFirst.mockResolvedValue(null);

      await expect(
        service.create(baseDto({ syllabusRegulationId: 999 }), admin as never),
      ).rejects.toThrow(/Regulation 999 does not exist/);
      expect(prisma.download.create).not.toHaveBeenCalled();
    });

    it('rejects a branch the programme does not have', async () => {
      prisma.syllabusRegulation.findFirst.mockResolvedValue(withBranches);
      prisma.departmentProgramme.findMany.mockResolvedValue([
        { name: 'Computer Science & Engineering' },
        { name: 'Civil Engineering' },
      ]);

      await expect(
        service.create(
          baseDto({ syllabusRegulationId: 7, syllabusBranch: 'Aeronautical' }),
          admin as never,
        ),
      ).rejects.toThrow(/not a branch of B.Tech \(UG\)/);
      expect(prisma.download.create).not.toHaveBeenCalled();
    });

    it('rejects a branch with no regulation to belong to', async () => {
      await expect(
        service.create(baseDto({ syllabusBranch: 'Civil Engineering' }), admin as never),
      ).rejects.toThrow(/needs the regulation/);
    });

    it('rejects a missing branch when the programme has them', async () => {
      prisma.syllabusRegulation.findFirst.mockResolvedValue(withBranches);
      prisma.departmentProgramme.findMany.mockResolvedValue([
        { name: 'Civil Engineering' },
      ]);

      await expect(
        service.create(baseDto({ syllabusRegulationId: 7 }), admin as never),
      ).rejects.toThrow(/needs a branch/);
    });

    it('rejects a branch on a course that has none', async () => {
      prisma.syllabusRegulation.findFirst.mockResolvedValue({
        ...withBranches,
        programme: { id: 3, name: 'BCA', level: null, nameContains: null },
      });

      await expect(
        service.create(
          baseDto({ syllabusRegulationId: 7, syllabusBranch: 'Civil Engineering' }),
          admin as never,
        ),
      ).rejects.toThrow(/has no branches/);
    });

    it('accepts a real regulation and a real branch', async () => {
      prisma.syllabusRegulation.findFirst.mockResolvedValue(withBranches);
      prisma.departmentProgramme.findMany.mockResolvedValue([
        { name: 'Civil Engineering' },
      ]);
      prisma.download.create.mockResolvedValue({ id: 5 });

      await expect(
        service.create(
          baseDto({ syllabusRegulationId: 7, syllabusBranch: 'Civil Engineering' }),
          admin as never,
        ),
      ).resolves.toBeDefined();
    });

    it('still accepts a syllabus with neither, which is every legacy one', async () => {
      prisma.download.create.mockResolvedValue({ id: 6 });

      await expect(service.create(baseDto(), admin as never)).resolves.toBeDefined();
      expect(prisma.syllabusRegulation.findFirst).not.toHaveBeenCalled();
    });
  });
});
