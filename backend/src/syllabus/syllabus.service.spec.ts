import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SyllabusService } from './syllabus.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('SyllabusService', () => {
  let service: SyllabusService;
  let prisma: {
    syllabusProgramme: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    syllabusRegulation: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      aggregate: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'a@b.com' } as never;

  beforeEach(async () => {
    prisma = {
      syllabusProgramme: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
        update: jest.fn(),
      },
      syllabusRegulation: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({ _min: { sortOrder: 0 } }),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation((ops) => Promise.all(ops)),
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        SyllabusService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = moduleRef.get(SyllabusService);
  });

  describe('public listing', () => {
    it('hides inactive and deleted regulations from the page', async () => {
      await service.findAllPublic();

      const args = prisma.syllabusProgramme.findMany.mock.calls[0][0];
      expect(args.where).toEqual({ isActive: true, deletedAt: null });
      expect(args.include.regulations.where).toEqual({
        isActive: true,
        deletedAt: null,
      });
    });
  });

  describe('programmes', () => {
    it('adds a new heading at the END, so B.Tech stays above a new course', async () => {
      prisma.syllabusProgramme.count.mockResolvedValue(3);
      prisma.syllabusProgramme.create.mockResolvedValue({ id: 4, sortOrder: 3 });

      await service.createProgramme({ name: 'BCA' }, admin);

      expect(prisma.syllabusProgramme.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ name: 'BCA', sortOrder: 3 }),
      });
    });

    it('409s on a stale version', async () => {
      prisma.syllabusProgramme.findFirst.mockResolvedValue({ id: 1, version: 3 });

      await expect(
        service.updateProgramme(1, { name: 'x', version: 2 }, admin),
      ).rejects.toThrow();
    });

    it('takes the regulations down with the programme', async () => {
      prisma.syllabusProgramme.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.syllabusProgramme.update.mockResolvedValue({ id: 1 });
      prisma.syllabusRegulation.updateMany.mockResolvedValue({ count: 2 });

      await service.deleteProgramme(1, admin);

      expect(prisma.syllabusRegulation.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { programmeId: 1, deletedAt: null },
        }),
      );
    });

    it('404s restoring a programme that was never deleted', async () => {
      prisma.syllabusProgramme.findFirst.mockResolvedValue(null);

      await expect(service.restoreProgramme(9, admin)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('regulations', () => {
    it('adds a new regulation at the FRONT - R26 above R23', async () => {
      prisma.syllabusProgramme.findFirst.mockResolvedValue({ id: 1, version: 1 });
      prisma.syllabusRegulation.aggregate.mockResolvedValue({
        _min: { sortOrder: 0 },
      });
      prisma.syllabusRegulation.create.mockResolvedValue({ id: 7, sortOrder: -1 });

      await service.createRegulation(1, { code: 'R26' }, admin);

      expect(prisma.syllabusRegulation.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ code: 'R26', programmeId: 1, sortOrder: -1 }),
      });
    });

    it('404s adding a regulation to a programme that does not exist', async () => {
      prisma.syllabusProgramme.findFirst.mockResolvedValue(null);

      await expect(
        service.createRegulation(99, { code: 'R26' }, admin),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('reordering', () => {
    it('rejects duplicate sortOrder values', async () => {
      await expect(
        service.reorderProgrammes(
          { items: [{ id: 1, sortOrder: 0 }, { id: 2, sortOrder: 0 }] },
          admin,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('refuses to reorder a regulation belonging to another programme', async () => {
      // Only one of the two ids comes back scoped to programme 1.
      prisma.syllabusRegulation.findMany.mockResolvedValue([{ id: 1 }]);

      await expect(
        service.reorderRegulations(
          1,
          { items: [{ id: 1, sortOrder: 0 }, { id: 2, sortOrder: 1 }] },
          admin,
        ),
      ).rejects.toThrow(BadRequestException);

      expect(prisma.syllabusRegulation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: { in: [1, 2] }, programmeId: 1, deletedAt: null },
        }),
      );
    });
  });
});
