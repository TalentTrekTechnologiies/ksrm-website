import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMediaFolderDto } from './dto/create-media-folder.dto';
import { UpdateMediaFolderDto } from './dto/update-media-folder.dto';

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Simple self-referencing folder tree. `path` is materialized (slash-joined
 * ancestor slugs) so the admin UI's breadcrumbs/lookups don't need a
 * recursive query - it's recomputed for a folder and all of its descendants
 * whenever that folder is renamed or moved.
 */
@Injectable()
export class MediaFoldersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.mediaFolder.findMany({ orderBy: { path: 'asc' } });
  }

  private async findOrThrow(id: number) {
    const folder = await this.prisma.mediaFolder.findUnique({ where: { id } });
    if (!folder) throw new NotFoundException(`Folder ${id} not found`);
    return folder;
  }

  async create(dto: CreateMediaFolderDto) {
    const parent = dto.parentId ? await this.findOrThrow(dto.parentId) : null;
    const path = parent
      ? `${parent.path}/${slugify(dto.name)}`
      : slugify(dto.name);

    try {
      return await this.prisma.mediaFolder.create({
        data: { name: dto.name, parentId: dto.parentId ?? null, path },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new BadRequestException(
          'A folder with that name already exists here.',
        );
      }
      throw err;
    }
  }

  async update(id: number, dto: UpdateMediaFolderDto) {
    const existing = await this.findOrThrow(id);

    const nextName = dto.name ?? existing.name;
    const nextParentId =
      dto.parentId === undefined ? existing.parentId : dto.parentId;

    if (nextParentId === id) {
      throw new BadRequestException('A folder cannot be its own parent.');
    }

    let nextParent: { path: string } | null = null;
    if (nextParentId !== null) {
      nextParent = await this.findOrThrow(nextParentId);
      if (await this.isDescendant(id, nextParentId)) {
        throw new BadRequestException(
          'Cannot move a folder into its own subtree.',
        );
      }
    }

    const oldPath = existing.path;
    const newPath = nextParent
      ? `${nextParent.path}/${slugify(nextName)}`
      : slugify(nextName);

    let updated;
    try {
      updated = await this.prisma.mediaFolder.update({
        where: { id },
        data: { name: nextName, parentId: nextParentId, path: newPath },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        throw new BadRequestException(
          'A folder with that name already exists here.',
        );
      }
      throw err;
    }

    if (oldPath !== newPath) {
      await this.reparentDescendantPaths(oldPath, newPath);
    }

    return updated;
  }

  async delete(id: number) {
    await this.findOrThrow(id);

    const [childCount, mediaCount] = await Promise.all([
      this.prisma.mediaFolder.count({ where: { parentId: id } }),
      this.prisma.media.count({ where: { folderId: id, deletedAt: null } }),
    ]);

    if (childCount > 0 || mediaCount > 0) {
      throw new ConflictException(
        `Folder is not empty (${childCount} subfolder(s), ${mediaCount} file(s)). Move or remove its contents first.`,
      );
    }

    return this.prisma.mediaFolder.delete({ where: { id } });
  }

  private async isDescendant(
    ancestorId: number,
    candidateId: number,
  ): Promise<boolean> {
    let current = await this.prisma.mediaFolder.findUnique({
      where: { id: candidateId },
    });
    while (current?.parentId) {
      if (current.parentId === ancestorId) return true;
      current = await this.prisma.mediaFolder.findUnique({
        where: { id: current.parentId },
      });
    }
    return false;
  }

  private async reparentDescendantPaths(
    oldPath: string,
    newPath: string,
  ): Promise<void> {
    const descendants = await this.prisma.mediaFolder.findMany({
      where: { path: { startsWith: `${oldPath}/` } },
    });

    await this.prisma.$transaction(
      descendants.map((d) =>
        this.prisma.mediaFolder.update({
          where: { id: d.id },
          data: { path: newPath + d.path.slice(oldPath.length) },
        }),
      ),
    );
  }
}
