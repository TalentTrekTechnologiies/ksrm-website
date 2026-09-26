import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DownloadCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateDownloadDto } from './dto/create-download.dto';
import { UpdateDownloadDto } from './dto/update-download.dto';
import { ReorderDownloadsDto } from './dto/reorder-downloads.dto';
import { BulkCreateDownloadsDto } from './dto/bulk-create-downloads.dto';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { RequestAdmin } from '../homepage/types';
import { assertMayReorderAll } from '../auth/reorder-ownership.util';
import { adminScopeWhere } from '../auth/admin-scope.util';
import { MediaLinkService } from '../media/media-link.service';

const MEDIA_MODULE = 'downloads';
const MEDIA_FIELD = 'fileUrl';

@Injectable()
export class DownloadsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private mediaLink: MediaLinkService,
  ) {}

  async findAllPublic(
    category?: DownloadCategory,
    departmentId?: number,
    pageSection?: string,
  ) {
    // A document whose file is gone must not be listed. The cascade on media
    // delete keeps this from arising going forward, but rows orphaned before
    // it existed - or by a forced delete - would otherwise stay published with
    // a button that hands the visitor the site's own homepage back, with no
    // error to notice. mediaId is a plain Int by design (no Prisma relation),
    // so the live ids are gathered and filtered on rather than joined.
    const gone = await this.prisma.media.findMany({
      where: {
        OR: [
          { deletedAt: { not: null } },
          { isActive: false },
          { isPrivate: true },
        ],
      },
      select: { id: true },
    });

    return this.prisma.download.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...(gone.length > 0 && {
          NOT: { mediaId: { in: gone.map((m) => m.id) } },
        }),
        ...(category && { category }),
        ...(departmentId !== undefined && { departmentId }),
        ...(pageSection && { pageSection }),
      },
      // sortOrder still lets an admin pin a document to the top; everything
      // else (all sortOrder 0 by default) falls back to newest-first, so fresh
      // uploads lead and older ones sink rather than the reverse.
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: 'desc' }, { id: 'desc' }],
    });
  }

  // includeDeleted surfaces soft-deleted rows too (deletedAt set) so the
  // admin UI can offer a restore action - excluded by default since most
  // callers want the live working set only.
  async findAllAdmin(
    includeDeleted = false,
    departmentId?: number,
    mediaId?: number,
    admin?: RequestAdmin,
  ) {
    return this.prisma.download.findMany({
      where: {
        ...(!includeDeleted && { deletedAt: null }),
        ...(departmentId !== undefined && { departmentId }),
        ...(mediaId !== undefined && { mediaId }),
        // Derived from the caller, not the query string: a scoped admin sees
        // only their own rows and cannot widen it by editing the URL.
        ...adminScopeWhere(admin, { department: true, page: true }),
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  private async findActiveOrThrow(id: number) {
    const record = await this.prisma.download.findFirst({
      where: { id, deletedAt: null },
    });
    if (!record) {
      throw new NotFoundException(`Download ${id} not found`);
    }
    return record;
  }

  /**
   * The lowest sortOrder in use, minus one - so a new document lands at the TOP
   * of the list.
   *
   * This used to be the row COUNT, which put every upload below everything
   * already published: the list sorts by sortOrder ascending, and each new row
   * got a bigger number than the last. A calendar published today appeared
   * under one from two years ago, and someone uploading a document had to
   * scroll to the bottom of the page to find it.
   *
   * Counting was doubly wrong - deleting a row makes the count collide with an
   * existing value, which is why 61 documents share only 38 distinct
   * sortOrders here.
   *
   * Going below the minimum rather than renumbering everything means the manual
   * order an admin has set with the reorder endpoint is left exactly as it is.
   */
  private async sortOrderForNewest(): Promise<number> {
    const lowest = await this.prisma.download.aggregate({
      _min: { sortOrder: true },
      where: { deletedAt: null },
    });
    return (lowest._min.sortOrder ?? 0) - 1;
  }

  /**
   * Refuses a syllabus filed against a regulation or a branch that does not
   * exist.
   *
   * The Syllabus screen only offers real ones, so this cannot be reached
   * through the UI - it is here because the UI is not the only way in, and a
   * document pointing at a regulation nobody added is a document that silently
   * never appears on the page. That failure has no error, no log and no
   * symptom until somebody goes looking for a syllabus that is not there.
   *
   * Only checks what is actually supplied. A syllabus uploaded without these
   * fields is still allowed - that is every one of the seventy-odd already
   * published, and they are matched by their titles instead.
   */
  private async assertSyllabusFiling(dto: {
    syllabusRegulationId?: number | null;
    syllabusBranch?: string | null;
  }) {
    const branch = dto.syllabusBranch?.trim();

    if (branch && dto.syllabusRegulationId == null) {
      throw new BadRequestException(
        'A syllabus branch needs the regulation it belongs to. Upload it from Academics -> Syllabus, which asks for both.',
      );
    }
    if (dto.syllabusRegulationId == null) return;

    const regulation = await this.prisma.syllabusRegulation.findFirst({
      where: { id: dto.syllabusRegulationId, deletedAt: null },
      include: { programme: true },
    });
    if (!regulation) {
      throw new BadRequestException(
        `Regulation ${dto.syllabusRegulationId} does not exist. Add it on Academics -> Syllabus first, then upload against it.`,
      );
    }

    const programme = regulation.programme;

    // A course with no branches must not claim one, and a course with
    // branches must name one the programme list actually has.
    if (!programme.level) {
      if (branch) {
        throw new BadRequestException(
          `"${programme.name}" has no branches, so a syllabus under ${regulation.code} cannot be filed against "${branch}".`,
        );
      }
      return;
    }

    const needle = programme.nameContains?.trim().toLowerCase();
    const available = (
      await this.prisma.departmentProgramme.findMany({
        where: { level: programme.level, isActive: true, deletedAt: null },
        select: { name: true },
      })
    )
      .map((p) => p.name)
      .filter((name) => !needle || name.toLowerCase().includes(needle));

    if (!branch) {
      throw new BadRequestException(
        `A syllabus under ${regulation.code} needs a branch. One of: ${available.join(', ') || 'none configured'}.`,
      );
    }
    if (!available.includes(branch)) {
      throw new BadRequestException(
        `"${branch}" is not a branch of ${programme.name}. One of: ${available.join(', ') || 'none configured'}.`,
      );
    }
  }

  async create(
    dto: CreateDownloadDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    await this.assertSyllabusFiling(dto);

    const sortOrder = dto.sortOrder ?? (await this.sortOrderForNewest());

    const resolvedUrl = await this.mediaLink.prepareLink(
      dto.mediaId,
      'DOCUMENT',
    );

    const created = await this.prisma.download.create({
      data: { ...dto, fileUrl: resolvedUrl ?? dto.fileUrl, sortOrder },
    });

    await this.mediaLink.syncUsage(
      MEDIA_MODULE,
      created.id,
      MEDIA_FIELD,
      dto.mediaId,
    );

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'downloads',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  /**
   * Publishes many documents in one go, sharing category/page/group across the
   * batch.
   *
   * Publishing a semester's results meant filling the same form once per PDF -
   * forty near-identical entries differing only in title and file. This takes
   * the files (already in the Media Library) plus one set of shared settings
   * and creates the rows together.
   *
   * Items are created sequentially rather than via createMany because each one
   * still needs its media usage tracked and its own audit entry - a bulk
   * publish must be as reviewable afterwards as forty single ones would have
   * been.
   */
  async bulkCreate(
    dto: BulkCreateDownloadsDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const { items, ...shared } = dto;

    // One starting point for the whole batch so the files keep the order they
    // were listed in, rather than each re-deriving one and colliding. The batch
    // goes above everything already published, and counts UP from there so the
    // first file listed stays first within the batch.
    let sortOrder = (await this.sortOrderForNewest()) - items.length + 1;

    const created: Awaited<ReturnType<typeof this.prisma.download.create>>[] =
      [];

    for (const item of items) {
      const resolvedUrl = await this.mediaLink.prepareLink(
        item.mediaId,
        'DOCUMENT',
      );
      const fileUrl = resolvedUrl ?? item.fileUrl;
      if (!fileUrl) {
        throw new BadRequestException(
          `"${item.title}" has no file - give it a mediaId or a fileUrl.`,
        );
      }

      const row = await this.prisma.download.create({
        data: {
          ...shared,
          title: item.title,
          mediaId: item.mediaId,
          fileUrl,
          sortOrder: sortOrder++,
        },
      });

      await this.mediaLink.syncUsage(
        MEDIA_MODULE,
        row.id,
        MEDIA_FIELD,
        item.mediaId,
      );

      await this.auditLog.log({
        adminId: admin.id,
        adminName: admin.name,
        adminEmail: admin.email,
        action: 'CREATE',
        module: 'downloads',
        targetId: row.id,
        details: { after: row },
        requestId,
      });

      created.push(row);
    }

    return created;
  }

  async update(
    id: number,
    dto: UpdateDownloadDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Download ${id}`);

    // Against the values the row will actually end up with, not just the ones
    // in this request: changing only the branch still has to be checked
    // against the regulation already on the document.
    await this.assertSyllabusFiling({
      syllabusRegulationId:
        rest.syllabusRegulationId !== undefined
          ? rest.syllabusRegulationId
          : existing.syllabusRegulationId,
      syllabusBranch:
        rest.syllabusBranch !== undefined
          ? rest.syllabusBranch
          : existing.syllabusBranch,
    });

    const resolvedUrl = await this.mediaLink.prepareLink(
      rest.mediaId,
      'DOCUMENT',
    );

    const updated = await this.prisma.download.update({
      where: { id },
      data: {
        ...rest,
        ...(resolvedUrl !== undefined && { fileUrl: resolvedUrl }),
        version: { increment: 1 },
      },
    });

    await this.mediaLink.syncUsage(MEDIA_MODULE, id, MEDIA_FIELD, rest.mediaId);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'downloads',
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

    const deleted = await this.prisma.download.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: admin.id,
        version: { increment: 1 },
      },
    });

    await this.mediaLink.untrackAll(MEDIA_MODULE, id);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'downloads',
      targetId: id,
      details: { before: existing },
      requestId,
    });

    return deleted;
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.download.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted download ${id} not found`);
    }

    const restored = await this.prisma.download.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    if (restored.mediaId) {
      await this.mediaLink.syncUsage(
        MEDIA_MODULE,
        id,
        MEDIA_FIELD,
        restored.mediaId,
      );
    }

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'downloads',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  async reorder(
    dto: ReorderDownloadsDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const sortOrders = dto.items.map((i) => i.sortOrder);
    if (new Set(sortOrders).size !== sortOrders.length) {
      throw new BadRequestException(
        'Duplicate sortOrder values in reorder payload',
      );
    }

    const ids = dto.items.map((i) => i.id);
    const existingRows = await this.prisma.download.findMany({
      where: { id: { in: ids }, deletedAt: null },
      select: { id: true, departmentId: true, pageSection: true },
    });
    if (existingRows.length !== ids.length) {
      throw new BadRequestException('One or more downloads do not exist');
    }

    // Neither ownership guard can cover this endpoint - both authorize one
    // target per request, and this payload carries many - so the same rules
    // are applied here over every row.
    assertMayReorderAll(existingRows, admin);

    await this.prisma.$transaction(
      dto.items.map((item) =>
        this.prisma.download.update({
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
      module: 'downloads',
      details: { items: dto.items },
      requestId,
    });

    return this.findAllAdmin();
  }
}
