import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogService } from '../../audit-log/audit-log.service';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { assertVersionMatch } from '../optimistic-lock.util';
import { RequestAdmin } from '../types';

// class-validator DTO arrays (HeroCaptionDto[]/HeroNewsTickerItemDto[]) are
// structurally plain JSON at runtime but not typed as such - Prisma's
// InputJsonValue wants a bare index signature a class type doesn't
// structurally satisfy. Validated shape is already enforced by the DTO's
// own decorators before this ever runs.
function toJsonInput(value: unknown): Prisma.InputJsonValue | undefined {
  return value === undefined ? undefined : (value as Prisma.InputJsonValue);
}

@Injectable()
export class HeroService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  /** Public site: the single active, non-deleted hero, or null if none has been configured yet. */
  async getPublic() {
    return this.prisma.homepageHero.findFirst({
      where: { isActive: true, deletedAt: null },
    });
  }

  /** Admin editor: the current hero regardless of active state, or null before the first save. */
  async getAdmin() {
    return this.prisma.homepageHero.findFirst({
      where: { deletedAt: null },
    });
  }

  /** Singleton create - only succeeds once; use update() after the first row exists. */
  async create(
    dto: CreateHeroDto,
    admin: RequestAdmin,
    requestId: string | undefined,
  ) {
    const existing = await this.prisma.homepageHero.findFirst({
      where: { deletedAt: null },
    });
    if (existing) {
      throw new ConflictException(
        'A homepage hero already exists - use PATCH to update it instead.',
      );
    }

    const created = await this.prisma.homepageHero.create({
      data: {
        ...dto,
        captions: toJsonInput(dto.captions),
        newsTicker: toJsonInput(dto.newsTicker),
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'CREATE',
      module: 'homepage_hero',
      targetId: created.id,
      details: { after: created },
      requestId,
    });

    return created;
  }

  async update(
    dto: UpdateHeroDto,
    admin: RequestAdmin,
    requestId: string | undefined,
  ) {
    const existing = await this.prisma.homepageHero.findFirst({
      where: { deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(
        'No homepage hero exists yet - use POST to create it first.',
      );
    }

    const { version, ...rest } = dto;
    assertVersionMatch(existing, version, 'Homepage hero');

    const updated = await this.prisma.homepageHero.update({
      where: { id: existing.id },
      data: {
        ...rest,
        captions: toJsonInput(rest.captions),
        newsTicker: toJsonInput(rest.newsTicker),
        version: { increment: 1 },
      },
    });

    await this.auditLog.log({
      adminId: admin.id,
      adminName: admin.name,
      adminEmail: admin.email,
      action: 'UPDATE',
      module: 'homepage_hero',
      targetId: updated.id,
      details: {
        before: existing,
        after: updated,
        changedFields: Object.keys(rest),
      },
      requestId,
    });

    return updated;
  }
}
