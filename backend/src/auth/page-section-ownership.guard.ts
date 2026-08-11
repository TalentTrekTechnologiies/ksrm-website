import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import {
  PAGE_SECTION_SCOPE_KEY,
  PageSectionScopeConfig,
} from './page-section.decorator';

/** `pages.examinations` -> `examinations`. */
const PAGE_PERMISSION_PREFIX = 'pages.';

/**
 * `examinations.timetables` -> `examinations`. A page's sub-sections all
 * belong to the same owner, so only the root before the first dot matters.
 */
export function pageSectionRoot(section: string): string {
  return section.split('.')[0];
}

/**
 * Enforces page ownership on write endpoints marked with
 * `@PageSectionScoped(...)` - "the Examination role edits the Examinations
 * pages and nothing else".
 *
 * Four models carry the same `pageSection` string (Download, GalleryImage,
 * PageTable, PageText), so one guard covers every page-driven content type
 * in the CMS rather than one mechanism per module.
 *
 * An admin is page-restricted if they hold ANY `pages.*` permission; the set
 * of those keys is their allow-list. Holding none means unrestricted, which
 * is what keeps Super Admins and the college-wide roles working unchanged.
 * Note this reads the admin's *permissions*, never their role name, per
 * DATA_MODEL_DESIGN.md §14.1.
 */
@Injectable()
export class PageSectionOwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = this.reflector.get<PageSectionScopeConfig>(
      PAGE_SECTION_SCOPE_KEY,
      context.getHandler(),
    );
    if (!config) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException('Not authenticated');
    if (user.isSuperAdmin) return true;

    const allowedRoots = (user.permissions ?? [])
      .filter((key: string) => key.startsWith(PAGE_PERMISSION_PREFIX))
      .map((key: string) => key.slice(PAGE_PERMISSION_PREFIX.length));

    // Not a page-scoped admin at all - this guard has nothing to say.
    if (allowedRoots.length === 0) return true;

    // A batch save is authorized as a whole: every item has to be on a page
    // this admin owns, so a mixed batch is rejected rather than partially
    // applied.
    if (config.source === 'bodyItems') {
      const items = (req.body?.[config.field] ?? []) as {
        pageSection?: string;
      }[];
      const allOwned = items.every(
        (item) =>
          item.pageSection &&
          allowedRoots.includes(pageSectionRoot(item.pageSection)),
      );
      if (!items.length || !allOwned) {
        throw new ForbiddenException(
          'You can only manage content on your own pages.',
        );
      }
      return true;
    }

    const targetSection = await this.resolveTargetSection(config, req);

    // Unlike the department guard's original rule, an unowned row is NOT a
    // free-for-all here: a page-restricted admin owns their pages and
    // nothing else, so content belonging to no page is somebody else's
    // problem. Super Admins and unrestricted roles still manage it.
    if (!targetSection) {
      throw new ForbiddenException(
        'You can only manage content on your own pages.',
      );
    }

    if (!allowedRoots.includes(pageSectionRoot(targetSection))) {
      throw new ForbiddenException(
        'You can only manage content on your own pages.',
      );
    }
    return true;
  }

  private async resolveTargetSection(
    config: PageSectionScopeConfig,
    req: { body?: { pageSection?: string }; params: Record<string, string> },
  ): Promise<string | null | undefined> {
    if (config.source === 'body') {
      return req.body?.pageSection;
    }
    if (config.source === 'bodyItems') return undefined;

    const delegate = (
      this.prisma as unknown as Record<string, { findUnique: Function }>
    )[config.model];
    const where =
      config.source === 'lookupKey'
        ? { key: req.params.key }
        : { id: Number(req.params.id) };
    const record = await delegate.findUnique({
      where,
      select: { pageSection: true },
    });
    return record?.pageSection;
  }
}
