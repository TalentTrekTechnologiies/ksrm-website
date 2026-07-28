import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { RequestAdmin } from '../homepage/types';
import { assertVersionMatch } from '../homepage/optimistic-lock.util';
import { MediaValidationService } from './media-validation.service';
import { MediaImageProcessingService } from './media-image-processing.service';
import { MediaProcessingQueueService } from './media-processing-queue.service';
import { MediaUsageService } from './media-usage.service';
import { LocalDiskStorageAdapter } from './storage/local-disk-storage.adapter';
import { UploadMediaDto } from './dto/upload-media.dto';
import { BulkUploadMediaDto } from './dto/bulk-upload-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { QueryMediaDto } from './dto/query-media.dto';
import { CropMediaDto } from './dto/crop-media.dto';

interface RequestAdminWithSuper extends RequestAdmin {
  isSuperAdmin?: boolean;
}

@Injectable()
export class MediaService {
  private readonly baseUrl: string;

  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
    private validation: MediaValidationService,
    private imageProcessing: MediaImageProcessingService,
    private processingQueue: MediaProcessingQueueService,
    private usageService: MediaUsageService,
    private storage: LocalDiskStorageAdapter,
    private configService: ConfigService,
  ) {
    this.baseUrl = (
      this.configService.get<string>('MEDIA_BASE_URL') ??
      `http://localhost:${this.configService.get<string>('PORT') ?? 4000}`
    ).replace(/\/$/, '');
  }

  // ---------------------------------------------------------------------
  // Upload
  // ---------------------------------------------------------------------

  async upload(
    file: Express.Multer.File,
    dto: UploadMediaDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const { type, extension } = await this.validation.validate(file);
    const checksumSha256 = await this.hashFile(file.path);

    // checksumSha256 is a DB-level unique column (not scoped to deletedAt:
    // null), so this lookup deliberately isn't filtered to active rows
    // either - a soft-deleted row with this checksum would otherwise cause
    // a raw unique-constraint violation on create() below instead of the
    // graceful outcomes handled here.
    const existing = await this.prisma.media.findFirst({ where: { checksumSha256 } });
    if (existing && !existing.deletedAt) {
      await fsp.rm(file.path, { force: true });
      return { deduplicated: true, media: this.toResponse(existing, []) };
    }
    if (existing && existing.deletedAt) {
      // Re-uploading content that matches a previously soft-deleted asset -
      // the content already exists in the system, just currently hidden,
      // so bring it back rather than erroring or creating a duplicate row.
      await fsp.rm(file.path, { force: true });
      const restored = await this.prisma.media.update({
        where: { id: existing.id },
        data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
      });
      await this.auditLog.log({
        adminId: admin.id,
        adminName: admin.name,
        adminEmail: admin.email,
        action: 'RESTORE',
        module: 'media',
        targetId: existing.id,
        details: { after: restored, changedFields: ['re-uploaded matching content'] },
        requestId,
      });
      const variants = await this.prisma.mediaVariant.findMany({ where: { mediaId: existing.id } });
      return { deduplicated: true, media: this.toResponse(restored, variants) };
    }

    const { storageKey, sizeBytes } = await this.storage.save(
      file.path,
      extension,
      file.mimetype,
    );
    await fsp.rm(file.path, { force: true });

    const created = await this.prisma.media.create({
      data: {
        type,
        originalFilename: file.originalname,
        storageKey,
        mimeType: file.mimetype,
        extension,
        sizeBytes: BigInt(sizeBytes),
        checksumSha256,
        title: dto.title,
        altText: dto.altText,
        caption: dto.caption,
        description: dto.description,
        folderId: dto.folderId ?? null,
        category: dto.category,
        tags: dto.tags ?? [],
        uploadedByAdminId: admin.id,
        processingStatus: 'PENDING',
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'media',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    this.processingQueue.enqueue(created.id);

    return { deduplicated: false, media: this.toResponse(created, []) };
  }

  async bulkUpload(
    files: Express.Multer.File[],
    dto: BulkUploadMediaDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const results: Array<{
      originalFilename: string;
      success: boolean;
      deduplicated?: boolean;
      media?: unknown;
      error?: string;
    }> = [];

    for (const file of files) {
      try {
        const result = await this.upload(file, dto, admin, requestId);
        results.push({
          originalFilename: file.originalname,
          success: true,
          deduplicated: result.deduplicated,
          media: result.media,
        });
      } catch (err) {
        await fsp.rm(file.path, { force: true }).catch(() => undefined);
        results.push({
          originalFilename: file.originalname,
          success: false,
          error: err instanceof Error ? err.message : 'Upload failed',
        });
      }
    }

    return { results };
  }

  private async hashFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('error', reject);
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }

  // ---------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------

  async findAllAdmin(query: QueryMediaDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 24;

    const where = {
      ...(query.type && { type: query.type }),
      ...(query.folderId !== undefined && { folderId: query.folderId }),
      ...(query.category && { category: query.category }),
      ...(query.tags &&
        query.tags.length > 0 && { tags: { hasSome: query.tags } }),
      ...(query.isActive !== undefined && { isActive: query.isActive }),
      ...(!query.includeDeleted && { deletedAt: null }),
      ...(query.q && {
        OR: [
          {
            originalFilename: {
              contains: query.q,
              mode: 'insensitive' as const,
            },
          },
          { title: { contains: query.q, mode: 'insensitive' as const } },
          { altText: { contains: query.q, mode: 'insensitive' as const } },
          { description: { contains: query.q, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where,
        include: { variants: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.media.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.toResponse(r, r.variants)),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number) {
    const media = await this.findAnyOrThrow(id);
    const variants = await this.prisma.mediaVariant.findMany({
      where: { mediaId: id },
    });
    return this.toResponse(media, variants);
  }

  async getUsages(id: number) {
    await this.findAnyOrThrow(id);
    return this.usageService.getUsagesForMedia(id);
  }

  async getVersions(id: number) {
    await this.findAnyOrThrow(id);
    return this.prisma.mediaVersion.findMany({
      where: { mediaId: id },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async getFacets() {
    const rows = await this.prisma.media.findMany({
      where: { deletedAt: null },
      select: { category: true, tags: true },
    });
    const categories = new Set<string>();
    const tags = new Set<string>();
    for (const row of rows) {
      if (row.category) categories.add(row.category);
      for (const t of row.tags) tags.add(t);
    }
    return { categories: [...categories].sort(), tags: [...tags].sort() };
  }

  private async findAnyOrThrow(id: number) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException(`Media ${id} not found`);
    return media;
  }

  private async findActiveOrThrow(id: number) {
    const media = await this.prisma.media.findFirst({
      where: { id, deletedAt: null },
    });
    if (!media) throw new NotFoundException(`Media ${id} not found`);
    return media;
  }

  // ---------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------

  async update(
    id: number,
    dto: UpdateMediaDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, `Media ${id}`);

    const updated = await this.prisma.media.update({
      where: { id },
      data: { ...rest, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'media',
      targetId: id,
      details: {
        before: existing,
        after: updated,
        changedFields: Object.keys(rest),
      },
      requestId,
    });

    return this.findOne(id);
  }

  // ---------------------------------------------------------------------
  // Replace / versioning
  // ---------------------------------------------------------------------

  async replace(
    id: number,
    file: Express.Multer.File,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const { type, extension } = await this.validation.validate(file);

    if (type !== existing.type) {
      await fsp.rm(file.path, { force: true });
      throw new BadRequestException(
        `Cannot replace a ${existing.type.toLowerCase()} with a ${type.toLowerCase()} file.`,
      );
    }

    const checksumSha256 = await this.hashFile(file.path);

    // Checked BEFORE anything destructive happens: checksumSha256 is
    // globally unique (dedup). Colliding with a DIFFERENT media row would
    // otherwise surface as a raw Prisma unique-constraint 500 from the
    // update below - by then the old variants are already deleted (see the
    // ordering note further down), leaving the asset permanently broken.
    // Catching it here means a bad replace attempt never touches anything.
    const collision = await this.prisma.media.findUnique({
      where: { checksumSha256 },
    });
    if (collision && collision.id !== id) {
      await fsp.rm(file.path, { force: true });
      throw new ConflictException(
        `This exact file already exists in the Media Library (as "${collision.originalFilename}", id ${collision.id}). Choose a different file, or use that existing asset instead.`,
      );
    }

    const { storageKey, sizeBytes } = await this.storage.save(
      file.path,
      extension,
      file.mimetype,
    );
    await fsp.rm(file.path, { force: true });

    const lastVersion = await this.prisma.mediaVersion.findFirst({
      where: { mediaId: id },
      orderBy: { versionNumber: 'desc' },
    });
    const nextVersionNumber = (lastVersion?.versionNumber ?? 0) + 1;

    await this.prisma.mediaVersion.create({
      data: {
        mediaId: id,
        versionNumber: nextVersionNumber,
        storageKey: existing.storageKey,
        mimeType: existing.mimeType,
        sizeBytes: existing.sizeBytes,
        checksumSha256: existing.checksumSha256,
        width: existing.width,
        height: existing.height,
        replacedByAdminId: admin.id,
      },
    });

    // The DB update happens BEFORE the old variants are deleted, not after.
    // If this update fails for any reason, the old variant files are still
    // on disk and still being served correctly under the old storageKey -
    // a failed Replace leaves the live asset untouched instead of 404ing it.
    let updated;
    try {
      updated = await this.prisma.media.update({
        where: { id },
        data: {
          storageKey,
          mimeType: file.mimetype,
          extension,
          sizeBytes: BigInt(sizeBytes),
          checksumSha256,
          originalFilename: file.originalname,
          processingStatus: 'PENDING',
          processingError: null,
          version: { increment: 1 },
        },
      });
    } catch (error) {
      // The new file was already written to storage above but nothing
      // references it yet (the Media row update didn't commit) - clean it
      // up rather than leaving an orphaned blob behind.
      await this.storage.delete(storageKey).catch(() => undefined);
      throw error;
    }

    // Only now, with the new row committed, is it safe to delete the old
    // variants - deleteVariantsForMedia protects existing.storageKey itself
    // (the MediaVersion snapshot above still points at it).
    await this.imageProcessing.deleteVariantsForMedia(id, existing.storageKey);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'REPLACE',
      module: 'media',
      targetId: id,
      details: { before: existing, after: updated },
      requestId,
    });

    this.processingQueue.enqueue(id);

    return this.findOne(id);
  }

  async rollback(
    id: number,
    versionId: number,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const targetVersion = await this.prisma.mediaVersion.findFirst({
      where: { id: versionId, mediaId: id },
    });
    if (!targetVersion) {
      throw new NotFoundException(
        `Version ${versionId} not found for media ${id}`,
      );
    }

    // Rollback is just another append - snapshot the CURRENT state first so
    // history is never rewritten and rolling back is itself auditable/undoable.
    const lastVersion = await this.prisma.mediaVersion.findFirst({
      where: { mediaId: id },
      orderBy: { versionNumber: 'desc' },
    });
    const nextVersionNumber = (lastVersion?.versionNumber ?? 0) + 1;

    await this.prisma.mediaVersion.create({
      data: {
        mediaId: id,
        versionNumber: nextVersionNumber,
        storageKey: existing.storageKey,
        mimeType: existing.mimeType,
        sizeBytes: existing.sizeBytes,
        checksumSha256: existing.checksumSha256,
        width: existing.width,
        height: existing.height,
        replacedByAdminId: admin.id,
      },
    });

    // Same protection as replace() above - existing.storageKey now belongs
    // to the version snapshot just created, so it must not be deleted even
    // though targetVersion.storageKey (a different, older file) is about
    // to become the live one.
    await this.imageProcessing.deleteVariantsForMedia(id, existing.storageKey);

    const updated = await this.prisma.media.update({
      where: { id },
      data: {
        storageKey: targetVersion.storageKey,
        mimeType: targetVersion.mimeType,
        sizeBytes: targetVersion.sizeBytes,
        checksumSha256: targetVersion.checksumSha256,
        width: targetVersion.width,
        height: targetVersion.height,
        processingStatus: 'PENDING',
        processingError: null,
        version: { increment: 1 },
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'ROLLBACK',
      module: 'media',
      targetId: id,
      details: {
        before: existing,
        after: updated,
        changedFields: ['rolledBackTo:' + versionId],
      },
      requestId,
    });

    this.processingQueue.enqueue(id);

    return this.findOne(id);
  }

  // ---------------------------------------------------------------------
  // Crop
  // ---------------------------------------------------------------------

  async crop(
    id: number,
    dto: CropMediaDto,
    admin: RequestAdmin,
    requestId?: string,
  ) {
    const existing = await this.findActiveOrThrow(id);
    if (existing.type !== 'IMAGE') {
      throw new BadRequestException('Only images can be cropped.');
    }

    await this.imageProcessing.generateCrop(id, dto.cropPreset, dto);

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CROP',
      module: 'media',
      targetId: id,
      details: { after: dto },
      requestId,
    });

    return this.findOne(id);
  }

  // ---------------------------------------------------------------------
  // Delete / restore
  // ---------------------------------------------------------------------

  async softDelete(
    id: number,
    admin: RequestAdminWithSuper,
    requestId?: string,
    force = false,
  ) {
    const existing = await this.findActiveOrThrow(id);
    const usages = await this.usageService.getUsagesForMedia(id);

    // Gallery rows are just "display this asset on a page" pointers - when the
    // asset itself is deleted the display must go with it, otherwise the public
    // page renders a broken image / black video tile (the orphan bug: delete a
    // video in the Media Library, the gallery row that shows it lingers and
    // still renders). So gallery usages CASCADE - the display row is
    // soft-deleted alongside the media - rather than blocking the delete. Every
    // other module still blocks with a 409 so an in-use faculty photo or logo
    // can't be silently broken.
    const galleryUsages = usages.filter((u) => u.module === 'gallery');
    const blocking = usages.filter((u) => u.module !== 'gallery');

    if (blocking.length > 0 && !force) {
      throw new ConflictException({
        statusCode: 409,
        error: 'MediaInUse',
        message: `Media ${id} is referenced in ${blocking.length} place(s) and cannot be deleted.`,
        usages: blocking.map((u) => ({
          module: u.module,
          recordId: u.recordId,
          field: u.field,
        })),
      });
    }

    if (blocking.length > 0 && force && !admin.isSuperAdmin) {
      throw new ForbiddenException(
        'Only a super admin can delete media that is still in use.',
      );
    }

    // Cascade the gallery display rows (soft-delete + drop their usage links)
    // so nothing on a public page keeps pointing at the now-deleted asset.
    for (const gu of galleryUsages) {
      await this.prisma.galleryImage.updateMany({
        where: { id: gu.recordId, deletedAt: null },
        data: {
          deletedAt: new Date(),
          deletedBy: admin.id,
          version: { increment: 1 },
        },
      });
      await this.usageService.untrackAll('gallery', gu.recordId);
    }

    const deleted = await this.prisma.media.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: admin.id,
        version: { increment: 1 },
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'DELETE',
      module: 'media',
      targetId: id,
      details: {
        before: existing,
        forced: blocking.length > 0 && force,
        cascadedGalleryRows: galleryUsages.map((u) => u.recordId),
      },
      requestId,
    });

    return deleted;
  }

  async bulkDelete(
    ids: number[],
    force: boolean,
    admin: RequestAdminWithSuper,
    requestId?: string,
  ) {
    const results: Array<{ id: number; success: boolean; error?: string }> = [];
    for (const id of ids) {
      try {
        await this.softDelete(id, admin, requestId, force);
        results.push({ id, success: true });
      } catch (err) {
        results.push({
          id,
          success: false,
          error: err instanceof Error ? err.message : 'Delete failed',
        });
      }
    }
    return { results };
  }

  async restore(id: number, admin: RequestAdmin, requestId?: string) {
    const existing = await this.prisma.media.findFirst({
      where: { id, NOT: { deletedAt: null } },
    });
    if (!existing) {
      throw new NotFoundException(`Deleted media ${id} not found`);
    }

    const restored = await this.prisma.media.update({
      where: { id },
      data: { deletedAt: null, deletedBy: null, version: { increment: 1 } },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'RESTORE',
      module: 'media',
      targetId: id,
      details: { after: restored },
      requestId,
    });

    return restored;
  }

  // ---------------------------------------------------------------------
  // Response shaping
  // ---------------------------------------------------------------------

  private toResponse(
    media: {
      id: number;
      [key: string]: unknown;
    },
    variants: Array<{
      variant: string;
      format: string;
      cropPreset?: string | null;
      width: number | null;
      height: number | null;
      sizeBytes: bigint;
    }>,
  ) {
    return {
      ...media,
      variants: variants.map((v) => ({
        variant: v.variant,
        format: v.format,
        cropPreset: v.cropPreset ?? null,
        width: v.width,
        height: v.height,
        sizeBytes: v.sizeBytes,
        url: `${this.baseUrl}/media/file/${media.id}/${v.variant}/${v.format}${
          v.cropPreset ? `?cropPreset=${v.cropPreset}` : ''
        }`,
      })),
    };
  }
}
