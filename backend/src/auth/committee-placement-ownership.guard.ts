import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/** `pages.library` -> `library`. */
const PAGE_PERMISSION_PREFIX = 'pages.';

/**
 * Which page a committee belongs to, by its placement.
 *
 * A committee is pointed at a page by `placement`, and a page-restricted admin
 * owns pages - so this is what ties the two together. Kept explicit rather
 * than derived from the enum name: CAMPUS_LIFE serves two pages and
 * ANTI_RAGGING is spelled with a dash on the page side.
 */
const PLACEMENT_PAGE: Record<string, string> = {
  ABOUT: 'about',
  IQAC: 'iqac',
  GRIEVANCE: 'grievance',
  ANTI_RAGGING: 'anti-ragging',
  CAMPUS_LIFE: 'campus-life',
  LIBRARY: 'library',
  KGCET: 'kgcet',
  NSS: 'nss',
};

/**
 * Stops a page-restricted admin editing committees that are not theirs.
 *
 * The department guard cannot do this job: it lets an admin with no
 * departmentId straight through, and the page-owning roles (Library,
 * Examination) deliberately have none. So granting them `committees.update` so
 * they can maintain their own committee would also have handed them the
 * Governing Body, the Academic Council and IQAC.
 *
 * The rule is the same one the page-section guard uses: an admin who holds any
 * `pages.*` permission owns those pages and nothing else. A committee with no
 * placement belongs to no page and is therefore college-wide - not theirs
 * either, which is deliberate rather than an oversight.
 *
 * Says nothing at all about super admins or admins who are not page-scoped;
 * they are handled by the permission check alone, as before.
 */
@Injectable()
export class CommitteePlacementOwnershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) throw new ForbiddenException('Not authenticated');
    if (user.isSuperAdmin) return true;

    const allowedRoots: string[] = (user.permissions ?? [])
      .filter((key: string) => key.startsWith(PAGE_PERMISSION_PREFIX))
      .map((key: string) => key.slice(PAGE_PERMISSION_PREFIX.length));

    // Not a page-scoped admin - this guard has nothing to say about them.
    if (allowedRoots.length === 0) return true;

    const placement = await this.resolvePlacement(req);

    const page = placement ? PLACEMENT_PAGE[placement] : null;
    if (!page || !allowedRoots.includes(page)) {
      throw new ForbiddenException(
        'You can only manage committees that belong to your own pages.',
      );
    }

    // Creating or moving a committee onto a page they do not own is the same
    // breach as editing one there, so the incoming placement is checked too.
    const incoming = req.body?.placement;
    if (incoming !== undefined && incoming !== null) {
      const incomingPage = PLACEMENT_PAGE[incoming];
      if (!incomingPage || !allowedRoots.includes(incomingPage)) {
        throw new ForbiddenException(
          'You can only place a committee on one of your own pages.',
        );
      }
    }

    return true;
  }

  /** The placement of whatever the request is about to change. */
  private async resolvePlacement(req: {
    params?: Record<string, string>;
    body?: Record<string, unknown>;
    path?: string;
    url?: string;
  }): Promise<string | null> {
    const params = req.params ?? {};

    // A route addressed by committee id: /:id, /:committeeId/members, ...
    const committeeId = params.committeeId ?? (this.isMemberRoute(req) ? null : params.id);
    if (committeeId) return this.placementOfCommittee(Number(committeeId));

    // A route addressed by MEMBER id - /members/:id - where the id names the
    // member, not the committee. Resolved through the member, because
    // checking it as a committee id would silently check the wrong committee.
    if (this.isMemberRoute(req) && params.id) {
      const memberId = Number(params.id);
      if (!Number.isFinite(memberId)) return null;
      const member = await this.prisma.committeeMember.findUnique({
        where: { id: memberId },
        select: { committee: { select: { placement: true } } },
      });
      return member?.committee?.placement ?? null;
    }

    // Creating a committee: the placement is whatever the body asks for.
    return (req.body?.placement as string) ?? null;
  }

  /** "/committees/members/12" and "/committees/members/12/restore". */
  private isMemberRoute(req: { path?: string; url?: string }): boolean {
    const path = req.path ?? req.url ?? '';
    return /\/members\/\d+/.test(path);
  }

  private async placementOfCommittee(id: number): Promise<string | null> {
    if (!Number.isFinite(id)) return null;
    const committee = await this.prisma.committee.findUnique({
      where: { id },
      select: { placement: true },
    });
    return committee?.placement ?? null;
  }
}
