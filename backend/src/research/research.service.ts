import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateResearchDto } from './dto/create-research.dto';
import { UpdateResearchDto } from './dto/update-research.dto';
import { RequestAdmin } from '../homepage/types';
import { MediaLinkService } from '../media/media-link.service';

const AUDIT_MODULE = 'research';
const MEDIA_FIELD = 'attachmentUrl';

@Injectable()
export class ResearchService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaLink: MediaLinkService,
  ) {}

  // departmentId omitted -> every active record (the site-wide Research/
  // Publications page); provided -> just that department's Research tab.
  async findAllPublic(departmentId?: number, facultyId?: number) {
    return this.prisma.research.findMany({
      where: {
        isActive: true,
        ...(departmentId !== undefined && { departmentId }),
        ...(facultyId !== undefined && { facultyId }),
      },
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findAllAdmin(departmentId?: number, facultyId?: number) {
    return this.prisma.research.findMany({
      where: {
        ...(departmentId !== undefined && { departmentId }),
        ...(facultyId !== undefined && { facultyId }),
      },
      orderBy: [{ year: 'desc' }, { createdAt: 'desc' }],
    });
  }

  private async findOrThrow(id: number) {
    const record = await this.prisma.research.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Research record ${id} not found`);
    }
    return record;
  }

  private async resolveDepartmentLabel(departmentId?: number, fallback?: string) {
    if (departmentId === undefined) return fallback;
    const department = await this.prisma.department.findUnique({
      where: { id: departmentId },
      select: { name: true },
    });
    return department?.name ?? fallback;
  }

  async create(dto: CreateResearchDto, admin: RequestAdmin, requestId?: string) {
    const resolvedUrl = await this.mediaLink.prepareLink(dto.mediaId, 'DOCUMENT');
    const department = await this.resolveDepartmentLabel(dto.departmentId, dto.department);

    const created = await this.prisma.research.create({
      data: {
        ...dto,
        department: department ?? dto.department ?? 'General',
        attachmentUrl: resolvedUrl ?? dto.attachmentUrl,
      },
    });

    await this.mediaLink.syncUsage(AUDIT_MODULE, created.id, MEDIA_FIELD, dto.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: AUDIT_MODULE,
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(id: number, dto: UpdateResearchDto, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findOrThrow(id);

    const resolvedUrl = await this.mediaLink.prepareLink(dto.mediaId, 'DOCUMENT');
    const department =
      dto.departmentId !== undefined
        ? await this.resolveDepartmentLabel(dto.departmentId, dto.department)
        : dto.department;

    const updated = await this.prisma.research.update({
      where: { id },
      data: {
        ...dto,
        ...(department !== undefined && { department }),
        ...(resolvedUrl !== undefined && { attachmentUrl: resolvedUrl }),
      },
    });

    await this.mediaLink.syncUsage(AUDIT_MODULE, id, MEDIA_FIELD, dto.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing, after: updated, changedFields: Object.keys(dto) },
      requestId,
    });

    return updated;
  }

  async delete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findOrThrow(id);

    const deleted = await this.prisma.research.delete({ where: { id } });

    await this.mediaLink.untrackAll(AUDIT_MODULE, id);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }
}
