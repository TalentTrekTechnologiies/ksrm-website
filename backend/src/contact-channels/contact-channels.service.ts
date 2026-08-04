import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateContactChannelDto } from './dto/create-contact-channel.dto';
import { UpdateContactChannelDto } from './dto/update-contact-channel.dto';
import { ReorderContactChannelsDto } from './dto/reorder-contact-channels.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';

const AUDIT_MODULE = 'contact_channels';

@Injectable()
export class ContactChannelsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  // departmentId omitted/null -> the global office directory (unchanged
  // default); a specific id -> that department's Contact Information. `group`
  // only matters for the global directory - see the schema comment on
  // ContactChannel.group - and is ignored (both groups returned) when unset,
  // which is what a department's Contact tab wants.
  async findAllPublic(departmentId: number | null = null, group?: string) {
    return this.prisma.contactChannel.findMany({
      where: {
        departmentId,
        isActive: true,
        deletedAt: null,
        ...(group && { group }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // departmentId: undefined -> no department filter at all (every row, rarely
  // wanted); null -> explicitly the global directory only; a number -> that
  // department. This three-way distinction is why departmentId is typed
  // `number | null | undefined` rather than just optional - the controller
  // has to be able to ask for "global only", which "omitted" cannot express.
  async findAllAdmin(departmentId?: number | null, includeDeleted = false, group?: string) {
    return this.prisma.contactChannel.findMany({
      where: {
        ...(departmentId !== undefined && { departmentId }),
        ...(!includeDeleted && { deletedAt: null }),
        ...(group && { group }),
      },
      orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.contactChannel.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Contact channel ${id} not found`);
    }
    return record;
  }

  async create(dto: CreateContactChannelDto, admin: RequestAdmin, requestId?: string) {
    // Scoped by group too, so a new office card doesn't inherit a sort
    // position from however many info-row cards already exist alongside it -
    // the two groups are separate visual lists on the page and should each
    // start their own count.
    const sortOrder =
      dto.sortOrder ??
      (await this.prisma.contactChannel.count({
        where: {
          departmentId: dto.departmentId ?? null,
          group: dto.group ?? 'directory',
          deletedAt: null,
        },
      }));

    const created = await this.prisma.contactChannel.create({
      data: { ...dto, sortOrder },
    });

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

  async update(id: number, dto: UpdateContactChannelDto, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Contact channel ${id}`);

    const updated = await this.prisma.contactChannel.update({
      where: { id },
      data: { ...rest, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { before: existing, after: updated, changedFields: Object.keys(rest) },
      requestId,
    });

    return updated;
  }

  async softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.contactChannel.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: admin.id, version: { increment: 1 } },
    });

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

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.contactChannel.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted contact channel ${id} not found`);
    }

    const restored = await this.prisma.contactChannel.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: AUDIT_MODULE,
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  async reorder(dto: ReorderContactChannelsDto, admin: RequestAdmin, requestId?: string) {
    const sortOrders = dto.items.map((i) => i.sortOrder);
    if (new Set(sortOrders).size !== sortOrders.length) {
      throw new BadRequestException('Duplicate sortOrder values in reorder payload');
    }

    const ids = dto.items.map((i) => i.id);
    const existingRows = await this.prisma.contactChannel.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException('One or more contact channels do not exist');
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.contactChannel.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'REORDER',
      module: AUDIT_MODULE,
      details: { items: dto.items },
      requestId,
    });

    return this.findAllAdmin();
  }
}
