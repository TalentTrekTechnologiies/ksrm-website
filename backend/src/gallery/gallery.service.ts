import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateGalleryImageDto } from './dto/create-gallery-image.dto';
import { UpdateGalleryImageDto } from './dto/update-gallery-image.dto';
import { ReorderGalleryImagesDto } from './dto/reorder-gallery-images.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';
import { MediaLinkService } from '../media/media-link.service';

const MEDIA_MODULE = 'gallery';
const MEDIA_FIELD = 'imageUrl';

@Injectable()
export class GalleryService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaLink: MediaLinkService,
  ) {}

  async findAllPublic(category?: string, departmentId?: number, pageSection?: string) {
    return this.prisma.galleryImage.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(category && { category }),
        ...(departmentId !== undefined && { departmentId }),
        ...(pageSection && { pageSection }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // includeDeleted surfaces soft-deleted rows too (deletedAt set) so the
  // admin UI can actually offer a restore action - excluded by default
  // since most callers (including reorder's own re-fetch) want the live
  // working set only.
  async findAllAdmin(includeDeleted = false, departmentId?: number, mediaId?: number) {
    return this.prisma.galleryImage.findMany({
      where: {
        ...(!includeDeleted && { deletedAt: null }),
        ...(departmentId !== undefined && { departmentId }),
        ...(mediaId !== undefined && { mediaId }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.galleryImage.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Gallery image ${id} not found`);
    }
    return record;
  }

  async create(
    dto: CreateGalleryImageDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const { date, sortOrder, ...rest } = dto;
    const resolvedSortOrder =
      sortOrder ??
      (await this.prisma.galleryImage.count({ where: { deletedAt: null } }));

    // imageUrl stays the DTO's own value unless a mediaId is also given, in
    // which case the Media Library's current URL for that asset wins - see
    // the DTO field comments for why (keeps Replace propagating for free).
    const resolvedUrl = await this.mediaLink.prepareLink(dto.mediaId, 'IMAGE');

    const created = await this.prisma.galleryImage.create({
      data: {
        ...rest,
        imageUrl: resolvedUrl ?? rest.imageUrl,
        // `category` is a required non-null column with no DB default, but
        // the DTO treats it as optional (per the module spec, category/
        // department linkage is a nice-to-have this sprint) - fall back to
        // an empty string rather than letting Prisma reject the insert.
        category: rest.category ?? '',
        date: date ? new Date(date) : undefined,
        sortOrder: resolvedSortOrder,
      },
    });

    await this.mediaLink.syncUsage(MEDIA_MODULE, created.id, MEDIA_FIELD, dto.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'gallery',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    id: number,
    dto: UpdateGalleryImageDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, date, ...rest } = dto;
    assertVersionMatch(existing, version, `Gallery image ${id}`);

    const resolvedUrl = await this.mediaLink.prepareLink(rest.mediaId, 'IMAGE');

    const updated = await this.prisma.galleryImage.update({
      where: { id },
      data: {
        ...rest,
        ...(resolvedUrl !== undefined && { imageUrl: resolvedUrl }),
        ...(date && { date: new Date(date) }),
        version: { increment: 1 },
      },
    });

    await this.mediaLink.syncUsage(MEDIA_MODULE, id, MEDIA_FIELD, rest.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'gallery',
      targetId: id,
      details: {
        before: existing,
        after: updated,
        changedFields: Object.keys(rest),
      },
      requestId,
    });

    return updated;
  }

  async softDelete(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.findActiveOrThrow(id);

    const deleted = await this.prisma.galleryImage.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: admin.id,
        version: { increment: 1 },
      },
    });

    // A soft-deleted gallery image is no longer live (excluded from
    // findAllPublic/findAllAdmin's default view), so it shouldn't keep
    // blocking its linked Media from deletion either - untrack now,
    // re-tracked on restore() below if the link is still there.
    await this.mediaLink.untrackAll(MEDIA_MODULE, id);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'gallery',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.galleryImage.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted gallery image ${id} not found`);
    }

    const restored = await this.prisma.galleryImage.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    // Mirror of the untrack in softDelete() - a restored row is live again,
    // so re-protect its linked Media (if it's still using one) from
    // deletion. A known limitation: if that Media was itself deleted while
    // this row was soft-deleted, this re-track has nothing to point at and
    // the admin will need to re-pick media manually - not auto-resolved.
    if (restored.mediaId) {
      await this.mediaLink.syncUsage(MEDIA_MODULE, id, MEDIA_FIELD, restored.mediaId);
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'gallery',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  async reorder(
    dto: ReorderGalleryImagesDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const sortOrders = dto.items.map((i) => i.sortOrder);
    if (new Set(sortOrders).size !== sortOrders.length) {
      throw new BadRequestException('Duplicate sortOrder values in reorder payload');
    }

    const ids = dto.items.map((i) => i.id);
    const existingRows = await this.prisma.galleryImage.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException('One or more gallery images do not exist');
    }

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.galleryImage.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder, version: { increment: 1 } },
        }),
      ),
    );

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'REORDER',
      module: 'gallery',
      details: { items: dto.items },
      requestId,
    });

    return this.findAllAdmin();
  }
}
