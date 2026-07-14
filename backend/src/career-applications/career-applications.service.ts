import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApplicationStatus, CareerApplication, Career } from '@prisma/client';
import * as fsp from 'fs/promises';
import ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { MediaService } from '../media/media.service';
import { MediaLinkService } from '../media/media-link.service';
import { MediaResolverService } from '../media/media-resolver.service';
import { SubmitCareerApplicationDto } from './dto/submit-career-application.dto';
import { UpdateApplicationNotesDto } from './dto/update-application-notes.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { AssignHrDto } from './dto/assign-hr.dto';
import { QueryCareerApplicationsDto } from './dto/query-career-applications.dto';
import { NotificationService } from '../mailer/notification.service';
import { RequestAdmin } from '../homepage/types';
import { SYSTEM_ADMIN_EMAIL } from '../common/system-admin.constant';
import { AdminNotificationsService } from '../admin-notifications/admin-notifications.service';

const AUDIT_MODULE = 'career_applications';
const MEDIA_FIELD = 'resumeUrl';

@Injectable()
export class CareerApplicationsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaService: MediaService,
    private mediaLink: MediaLinkService,
    private mediaResolver: MediaResolverService,
    private notification: NotificationService,
    private config: ConfigService,
    private adminNotifications: AdminNotificationsService,
  ) {}

  // Service-account identity for Media/AuditLog attribution on this
  // public, unauthenticated submission flow - see the constant's doc
  // comment for why this exists instead of a nullable adminId.
  private async getSystemAdmin(): Promise<RequestAdmin> {
    const admin = await this.prisma.admin.findUniqueOrThrow({
      where: { email: SYSTEM_ADMIN_EMAIL },
    });
    return { id: admin.id, name: admin.name, email: admin.email };
  }

  async submit(
    dto: SubmitCareerApplicationDto,
    file: Express.Multer.File,
    requestId?: string,
  ): Promise<CareerApplication> {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }

    const windowHours = Number(
      this.config.get('CAREER_APPLICATION_DUPLICATE_WINDOW_HOURS', 24),
    );
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
    const recentDuplicate = await this.prisma.careerApplication.findFirst({
      where: {
        email: dto.email,
        careerId: dto.careerId ?? null,
        createdAt: { gte: since },
      },
    });
    if (recentDuplicate) {
      throw new ConflictException(
        'You have already applied for this position recently. Please wait before applying again.',
      );
    }

    let career: Career | null = null;
    if (dto.careerId) {
      career = await this.prisma.career.findFirst({
        where: { id: dto.careerId, isActive: true, deletedAt: null },
      });
      if (!career) {
        throw new BadRequestException(
          'The selected job posting does not exist or is no longer open.',
        );
      }
    }

    // Read the resume into memory for the HR email attachment BEFORE
    // mediaService.upload() runs - it deletes the tmp file once the
    // content is safely in Media Library storage.
    const resumeBuffer = await fsp.readFile(file.path);
    const resumeFilename = file.originalname;

    const systemAdmin = await this.getSystemAdmin();

    const uploadResult = await this.mediaService.upload(
      file,
      {
        title: `${dto.fullName} - Resume`,
        category: 'career-resume',
        tags: ['resume', 'career-application'],
      },
      systemAdmin,
      requestId,
    );
    const mediaId = (uploadResult.media as { id: number }).id;
    // Not resolveUrl() - the ORIGINAL/SOURCE MediaVariant row for this
    // upload is created asynchronously by the processing queue moments
    // after upload() returns; resolveUrl() would lose that race and
    // return null. Documents always get exactly this one variant, so the
    // URL is safe to build deterministically here.
    const resumeUrl = this.mediaResolver.buildFileUrl(mediaId, 'ORIGINAL', 'SOURCE');

    const { skills, dateOfBirth, careerId, ...rest } = dto;

    const created = await this.prisma.$transaction(async (tx) => {
      const application = await tx.careerApplication.create({
        data: {
          ...rest,
          careerId: careerId ?? null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          skills: skills ?? [],
          resumeMediaId: mediaId,
          resumeUrl,
          status: 'APPLIED',
        },
      });
      await tx.careerApplicationStatusHistory.create({
        data: { applicationId: application.id, status: 'APPLIED' },
      });
      return application;
    });

    await this.mediaLink.syncUsage(AUDIT_MODULE, created.id, MEDIA_FIELD, mediaId);

    await this.auditLog.log({
      adminId: systemAdmin.id,
      adminName: systemAdmin.name,
      adminEmail: systemAdmin.email,
      action: 'CREATE',
      module: AUDIT_MODULE,
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    // Best-effort - NotificationService swallows send failures so a broken
    // email provider never fails an application that's already saved.
    await this.sendHrNotification(created, career, resumeBuffer, resumeFilename);
    await this.sendApplicantConfirmation(created, career);

    await this.adminNotifications.notifyByPermission('career_applications.view', {
      type: 'CAREER_APPLICATION_RECEIVED',
      title: 'New job application received',
      message: `${created.fullName} applied${career ? ` for ${career.title}` : ''}`,
      link: `/admin/careers/applications`,
    });

    return created;
  }

  private async sendHrNotification(
    application: CareerApplication,
    career: Career | null,
    resumeBuffer: Buffer,
    resumeFilename: string,
  ) {
    const hrEmail = this.config.get<string>('HR_NOTIFICATION_EMAIL');
    if (!hrEmail) return;

    const rows: [string, string | number | null | undefined][] = [
      ['Position', career?.title ?? 'General Application'],
      ['Name', application.fullName],
      ['Email', application.email],
      ['Mobile', application.mobile],
      ['Qualification', application.qualification],
      ['Specialization', application.specialization],
      [
        'Experience',
        application.yearsOfExperience != null
          ? `${application.yearsOfExperience} years`
          : undefined,
      ],
      ['Current Company', application.currentCompany],
      ['Current CTC', application.currentCtc],
      ['Expected CTC', application.expectedCtc],
      ['Notice Period', application.noticePeriod],
      ['LinkedIn', application.linkedinUrl],
      ['Portfolio', application.portfolioUrl],
      ['Submitted', application.createdAt.toLocaleString('en-IN')],
    ];

    const html = `
      <h2>New Job Application</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(
            ([label, value]) =>
              `<tr><td style="font-weight:bold;border-bottom:1px solid #eee">${label}</td><td style="border-bottom:1px solid #eee">${value}</td></tr>`,
          )
          .join('')}
      </table>
      ${application.coverLetter ? `<h3>Cover Letter</h3><p>${application.coverLetter}</p>` : ''}
      ${application.additionalNotes ? `<h3>Additional Notes</h3><p>${application.additionalNotes}</p>` : ''}
      <p>Resume attached. View this application in the admin CMS under Careers &rarr; Applications.</p>
    `;

    await this.notification.send({
      to: hrEmail,
      subject: `New Application: ${application.fullName} - ${career?.title ?? 'General Application'}`,
      html,
      attachments: [{ filename: resumeFilename, content: resumeBuffer }],
    });
  }

  private async sendApplicantConfirmation(
    application: CareerApplication,
    career: Career | null,
  ) {
    const html = `
      <p>Dear ${application.fullName},</p>
      <p>Thank you for applying to KSRM College of Engineering${
        career ? ` for the position of <strong>${career.title}</strong>` : ''
      }. We have received your application and our HR team will review it shortly.</p>
      <p>If shortlisted, we will contact you using the details you provided.</p>
      <p>Regards,<br/>KSRM College of Engineering</p>
    `;

    await this.notification.send({
      to: application.email,
      subject: 'Application Received - KSRM College of Engineering',
      html,
      text: `Dear ${application.fullName}, thank you for applying to KSRM College of Engineering. We have received your application.`,
    });
  }

  async findAllAdmin(query: QueryCareerApplicationsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where = this.buildWhere(query);

    const [items, total] = await Promise.all([
      this.prisma.careerApplication.findMany({
        where,
        include: {
          career: { select: { id: true, title: true } },
          assignedHr: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.careerApplication.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  private buildWhere(query: QueryCareerApplicationsDto) {
    return {
      ...(query.status && { status: query.status }),
      ...(query.careerId !== undefined && { careerId: query.careerId }),
      ...(query.assignedHrId !== undefined && { assignedHrId: query.assignedHrId }),
      ...((query.from || query.to) && {
        createdAt: {
          ...(query.from && { gte: new Date(query.from) }),
          ...(query.to && { lte: new Date(query.to) }),
        },
      }),
      ...(query.search && {
        OR: [
          { fullName: { contains: query.search, mode: 'insensitive' as const } },
          { email: { contains: query.search, mode: 'insensitive' as const } },
          { mobile: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }),
    };
  }

  async findOne(id: number) {
    const application = await this.prisma.careerApplication.findUnique({
      where: { id },
      include: {
        career: { select: { id: true, title: true } },
        assignedHr: { select: { id: true, name: true, email: true } },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: { changedByAdmin: { select: { id: true, name: true } } },
        },
      },
    });
    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }
    return application;
  }

  private async findOrThrow(id: number) {
    const application = await this.prisma.careerApplication.findUnique({ where: { id } });
    if (!application) {
      throw new NotFoundException(`Application ${id} not found`);
    }
    return application;
  }

  async updateNotes(
    id: number,
    dto: UpdateApplicationNotesDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findOrThrow(id);

    const updated = await this.prisma.careerApplication.update({
      where: { id },
      data: { notes: dto.notes },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: { notes: existing.notes }, after: { notes: updated.notes }, changedFields: ['notes'] },
      requestId,
    });

    return updated;
  }

  async updateStatus(
    id: number,
    dto: UpdateApplicationStatusDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findOrThrow(id);

    const [updated] = await this.prisma.$transaction([
      this.prisma.careerApplication.update({
        where: { id },
        data: { status: dto.status },
      }),
      this.prisma.careerApplicationStatusHistory.create({
        data: {
          applicationId: id,
          status: dto.status,
          note: dto.note,
          changedByAdminId: admin.id,
        },
      }),
    ]);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: id,
      details: {
        before: { status: existing.status },
        after: { status: updated.status },
        changedFields: ['status'],
      },
      requestId,
    });

    return updated;
  }

  async assignHr(id: number, dto: AssignHrDto, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findOrThrow(id);

    const hr = await this.prisma.admin.findFirst({
      where: { id: dto.adminId, isActive: true, deletedAt: null },
    });
    if (!hr) {
      throw new BadRequestException(`Admin ${dto.adminId} does not exist or is not active.`);
    }

    const updated = await this.prisma.careerApplication.update({
      where: { id },
      data: { assignedHrId: dto.adminId },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: id,
      details: {
        before: { assignedHrId: existing.assignedHrId },
        after: { assignedHrId: updated.assignedHrId },
        changedFields: ['assignedHrId'],
      },
      requestId,
    });

    return updated;
  }

  async exportCsv(query: QueryCareerApplicationsDto): Promise<string> {
    const where = this.buildWhere(query);
    const rows = await this.prisma.careerApplication.findMany({
      where,
      include: { career: { select: { title: true } }, assignedHr: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    const header = [
      'id', 'fullName', 'email', 'mobile', 'qualification', 'specialization',
      'yearsOfExperience', 'currentCompany', 'noticePeriod', 'position',
      'status', 'assignedHr', 'source', 'submittedAt',
    ];
    const lines = [header.join(',')];
    for (const r of rows) {
      lines.push(
        [
          r.id, r.fullName, r.email, r.mobile, r.qualification, r.specialization ?? '',
          r.yearsOfExperience ?? '', r.currentCompany ?? '', r.noticePeriod ?? '',
          r.career?.title ?? '', r.status, r.assignedHr?.name ?? '', r.source,
          r.createdAt.toISOString(),
        ]
          .map(csvEscape)
          .join(','),
      );
    }
    return lines.join('\n');
  }

  async exportExcel(query: QueryCareerApplicationsDto): Promise<Buffer> {
    const where = this.buildWhere(query);
    const rows = await this.prisma.careerApplication.findMany({
      where,
      include: { career: { select: { title: true } }, assignedHr: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10000,
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Applications');
    sheet.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Full Name', key: 'fullName', width: 24 },
      { header: 'Email', key: 'email', width: 28 },
      { header: 'Mobile', key: 'mobile', width: 16 },
      { header: 'Qualification', key: 'qualification', width: 24 },
      { header: 'Specialization', key: 'specialization', width: 24 },
      { header: 'Experience (yrs)', key: 'yearsOfExperience', width: 14 },
      { header: 'Current Company', key: 'currentCompany', width: 24 },
      { header: 'Notice Period', key: 'noticePeriod', width: 16 },
      { header: 'Position', key: 'position', width: 28 },
      { header: 'Status', key: 'status', width: 20 },
      { header: 'Assigned HR', key: 'assignedHr', width: 20 },
      { header: 'Source', key: 'source', width: 12 },
      { header: 'Submitted At', key: 'submittedAt', width: 22 },
    ];
    sheet.getRow(1).font = { bold: true };

    for (const r of rows) {
      sheet.addRow({
        id: r.id,
        fullName: r.fullName,
        email: r.email,
        mobile: r.mobile,
        qualification: r.qualification,
        specialization: r.specialization ?? '',
        yearsOfExperience: r.yearsOfExperience ?? '',
        currentCompany: r.currentCompany ?? '',
        noticePeriod: r.noticePeriod ?? '',
        position: r.career?.title ?? '',
        status: r.status,
        assignedHr: r.assignedHr?.name ?? '',
        source: r.source,
        submittedAt: r.createdAt.toISOString(),
      });
    }

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  async getDashboardCounts() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const [today, thisWeek, pendingReview, shortlisted, selected] = await Promise.all([
      this.prisma.careerApplication.count({ where: { createdAt: { gte: startOfToday } } }),
      this.prisma.careerApplication.count({ where: { createdAt: { gte: startOfWeek } } }),
      this.prisma.careerApplication.count({
        where: { status: { in: ['APPLIED', 'UNDER_REVIEW'] as ApplicationStatus[] } },
      }),
      this.prisma.careerApplication.count({ where: { status: 'SHORTLISTED' } }),
      this.prisma.careerApplication.count({ where: { status: 'SELECTED' } }),
    ]);

    return {
      applicationsToday: today,
      applicationsThisWeek: thisWeek,
      pendingReview,
      shortlisted,
      selected,
    };
  }
}

function csvEscape(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}
