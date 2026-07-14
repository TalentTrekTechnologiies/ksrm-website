import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExamNotificationsService } from './exam-notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

describe('ExamNotificationsService', () => {
  let service: ExamNotificationsService;
  let prisma: {
    examNotification: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  let auditLog: { log: jest.Mock };

  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };

  beforeEach(async () => {
    prisma = {
      examNotification: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamNotificationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();

    service = module.get(ExamNotificationsService);
  });

  describe('findAllPublic', () => {
    it('only returns published, active notifications currently inside their date window', async () => {
      prisma.examNotification.findMany.mockResolvedValue([]);

      await service.findAllPublic();

      expect(prisma.examNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isPublished: true,
            isActive: true,
            startDate: { lte: expect.any(Date) },
            OR: [{ endDate: null }, { endDate: { gte: expect.any(Date) } }],
          }),
        }),
      );
    });
  });

  describe('create', () => {
    it('converts startDate/endDate strings to Date instances and logs CREATE', async () => {
      prisma.examNotification.create.mockResolvedValue({ id: 5 });

      await service.create(
        { title: 'Hall Ticket', startDate: '2026-08-01', endDate: '2026-08-15' } as any,
        admin,
        undefined,
      );

      const data = prisma.examNotification.create.mock.calls[0][0].data;
      expect(data.startDate).toBeInstanceOf(Date);
      expect(data.endDate).toBeInstanceOf(Date);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', module: 'exam_notifications' }),
      );
    });

    it('leaves endDate undefined (open-ended) when not provided', async () => {
      prisma.examNotification.create.mockResolvedValue({ id: 5 });

      await service.create({ title: 'Results', startDate: '2026-08-01' } as any, admin, undefined);

      const data = prisma.examNotification.create.mock.calls[0][0].data;
      expect(data.endDate).toBeUndefined();
    });
  });

  describe('update', () => {
    it('404s when the notification does not exist', async () => {
      prisma.examNotification.findUnique.mockResolvedValue(null);

      await expect(
        service.update(99, { title: 'x' } as any, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('leaves endDate untouched when not provided in the update payload', async () => {
      prisma.examNotification.findUnique.mockResolvedValue({ id: 1, endDate: new Date() });
      prisma.examNotification.update.mockResolvedValue({ id: 1 });

      await service.update(1, { title: 'Updated title' } as any, admin, undefined);

      expect(prisma.examNotification.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.not.objectContaining({ endDate: expect.anything() }) }),
      );
    });
  });

  describe('setPublished', () => {
    it('publishes and logs PUBLISH', async () => {
      prisma.examNotification.findUnique.mockResolvedValue({ id: 1, isPublished: false });
      prisma.examNotification.update.mockResolvedValue({ id: 1, isPublished: true });

      await service.setPublished(1, true, admin, undefined);

      expect(prisma.examNotification.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isPublished: true },
      });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'PUBLISH' }),
      );
    });

    it('unpublishes and logs UNPUBLISH', async () => {
      prisma.examNotification.findUnique.mockResolvedValue({ id: 1, isPublished: true });
      prisma.examNotification.update.mockResolvedValue({ id: 1, isPublished: false });

      await service.setPublished(1, false, admin, undefined);

      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UNPUBLISH' }),
      );
    });
  });

  describe('delete', () => {
    it('404s when the notification does not exist', async () => {
      prisma.examNotification.findUnique.mockResolvedValue(null);

      await expect(service.delete(99, admin, undefined)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('hard-deletes (no soft-delete columns) and logs DELETE', async () => {
      prisma.examNotification.findUnique.mockResolvedValue({ id: 1 });
      prisma.examNotification.delete.mockResolvedValue({ id: 1 });

      await service.delete(1, admin, undefined);

      expect(prisma.examNotification.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', module: 'exam_notifications' }),
      );
    });
  });
});
