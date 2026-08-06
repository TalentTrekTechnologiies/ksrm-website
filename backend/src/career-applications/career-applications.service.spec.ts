import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CareerApplicationsService } from './career-applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaService } from '../media/media.service';
import { MediaLinkService } from '../media/media-link.service';
import { MediaResolverService } from '../media/media-resolver.service';
import { NotificationService } from '../mailer/notification.service';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';

jest.mock('fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue(Buffer.from('fake resume content')),
}));

describe('CareerApplicationsService', () => {
  let service: CareerApplicationsService;
  let prisma: {
    // A submitted resume is marked private the moment it is stored, so the
    // Media Library picker can never surface an applicant's CV. The mock
    // predates that.
    media: { update: jest.Mock };
    careerApplication: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      count: jest.Mock;
      update: jest.Mock;
    };
    careerApplicationStatusHistory: { create: jest.Mock };
    career: { findFirst: jest.Mock; findUnique: jest.Mock };
    admin: { findUniqueOrThrow: jest.Mock; findFirst: jest.Mock };
    $transaction: jest.Mock;
  };
  let auditLog: { log: jest.Mock };
  let mediaService: { upload: jest.Mock };
  let mediaLink: { syncUsage: jest.Mock };
  let mediaResolver: { buildFileUrl: jest.Mock };
  let notification: { send: jest.Mock };
  let config: { get: jest.Mock };

  const systemAdminRow = { id: 99, name: 'System (Public Submissions)', email: 'system@ksrm.internal' };
  const admin = { id: 1, name: 'Admin', email: 'admin@ksrm.edu' };
  const file = { path: '/tmp/resume.pdf', originalname: 'resume.pdf' } as Express.Multer.File;

  beforeEach(async () => {
    prisma = {
      media: { update: jest.fn().mockResolvedValue({}) },
      careerApplication: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      careerApplicationStatusHistory: { create: jest.fn() },
      career: { findFirst: jest.fn(), findUnique: jest.fn() },
      admin: { findUniqueOrThrow: jest.fn().mockResolvedValue(systemAdminRow), findFirst: jest.fn() },
      $transaction: jest.fn(),
    };
    auditLog = { log: jest.fn().mockResolvedValue(undefined) };
    mediaService = {
      upload: jest.fn().mockResolvedValue({ deduplicated: false, media: { id: 42 } }),
    };
    mediaLink = { syncUsage: jest.fn().mockResolvedValue(undefined) };
    mediaResolver = {
      buildFileUrl: jest.fn().mockReturnValue('http://localhost:4000/media/file/42/ORIGINAL/SOURCE'),
    };
    notification = { send: jest.fn().mockResolvedValue(undefined) };
    config = { get: jest.fn().mockImplementation((_key: string, fallback?: unknown) => fallback) };
    const adminNotifications = { notifyByPermission: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CareerApplicationsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditLogService, useValue: auditLog },
        { provide: MediaService, useValue: mediaService },
        { provide: MediaLinkService, useValue: mediaLink },
        { provide: MediaResolverService, useValue: mediaResolver },
        { provide: NotificationService, useValue: notification },
        { provide: ConfigService, useValue: config },
        { provide: AdminNotificationsService, useValue: adminNotifications },
      ],
    }).compile();

    service = module.get(CareerApplicationsService);
  });

  describe('submit', () => {
    const dto = {
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      mobile: '+919876543210',
      qualification: 'B.Tech',
    } as any;

    it('rejects submission with no resume file', async () => {
      await expect(service.submit(dto, undefined as any, undefined)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects a duplicate submission within the configured window', async () => {
      prisma.careerApplication.findFirst.mockResolvedValue({ id: 5 });

      await expect(service.submit(dto, file, undefined)).rejects.toBeInstanceOf(ConflictException);
      expect(mediaService.upload).not.toHaveBeenCalled();
    });

    it('rejects when careerId points at a non-existent or closed posting', async () => {
      prisma.careerApplication.findFirst.mockResolvedValue(null);
      prisma.career.findFirst.mockResolvedValue(null);

      await expect(
        service.submit({ ...dto, careerId: 999 }, file, undefined),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('uploads the resume via MediaService and creates the application + initial timeline row', async () => {
      prisma.careerApplication.findFirst.mockResolvedValue(null);
      prisma.$transaction.mockImplementation(async (fn: any) => {
        if (typeof fn === 'function') {
          const tx = {
            careerApplication: { create: jest.fn().mockResolvedValue({ id: 7, ...dto, status: 'APPLIED' }) },
            careerApplicationStatusHistory: { create: jest.fn().mockResolvedValue({}) },
          };
          return fn(tx);
        }
      });

      const result = await service.submit(dto, file, 'req-1');

      expect(mediaService.upload).toHaveBeenCalledWith(
        file,
        expect.objectContaining({ category: 'career-resume' }),
        expect.objectContaining({ id: systemAdminRow.id }),
        'req-1',
      );
      expect(result.id).toBe(7);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'CREATE', module: 'career_applications' }),
      );
      // Both emails fire - HR (skipped, no HR_NOTIFICATION_EMAIL configured
      // in this test's ConfigService mock) and applicant confirmation.
      expect(notification.send).toHaveBeenCalledWith(
        expect.objectContaining({ to: dto.email, subject: expect.stringContaining('Application Received') }),
      );
    });
  });

  describe('updateStatus', () => {
    it('creates a timeline row and logs the transition', async () => {
      prisma.careerApplication.findUnique.mockResolvedValue({ id: 1, status: 'APPLIED' });
      prisma.$transaction.mockResolvedValue([{ id: 1, status: 'SHORTLISTED' }]);

      await service.updateStatus(1, { status: 'SHORTLISTED' as any }, admin, undefined);

      expect(prisma.$transaction).toHaveBeenCalled();
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          details: expect.objectContaining({ changedFields: ['status'] }),
        }),
      );
    });

    it('404s on an unknown application id', async () => {
      prisma.careerApplication.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus(999, { status: 'SHORTLISTED' as any }, admin, undefined),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('assignHr', () => {
    it('rejects assigning to an inactive/non-existent admin', async () => {
      prisma.careerApplication.findUnique.mockResolvedValue({ id: 1, assignedHrId: null });
      prisma.admin.findFirst.mockResolvedValue(null);

      await expect(service.assignHr(1, { adminId: 55 }, admin, undefined)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('assigns HR and logs the change', async () => {
      prisma.careerApplication.findUnique.mockResolvedValue({ id: 1, assignedHrId: null });
      prisma.admin.findFirst.mockResolvedValue({ id: 2, isActive: true });
      prisma.careerApplication.update.mockResolvedValue({ id: 1, assignedHrId: 2 });

      const result = await service.assignHr(1, { adminId: 2 }, admin, undefined);

      expect(result.assignedHrId).toBe(2);
      expect(auditLog.log).toHaveBeenCalledWith(
        expect.objectContaining({ details: expect.objectContaining({ changedFields: ['assignedHrId'] }) }),
      );
    });
  });

  describe('getDashboardCounts', () => {
    it('returns the five widget counts', async () => {
      prisma.careerApplication.count.mockResolvedValue(3);

      const result = await service.getDashboardCounts();

      expect(result).toEqual({
        applicationsToday: 3,
        applicationsThisWeek: 3,
        pendingReview: 3,
        shortlisted: 3,
        selected: 3,
      });
    });
  });
});
