import { ForbiddenException } from '@nestjs/common';
import { RequestAdmin } from '../homepage/types';
import { pageSectionRoot } from './page-section-ownership.guard';

/** One row of a reorder payload, as loaded from the database. */
export interface OwnableRow {
  departmentId?: number | null;
  pageSection?: string | null;
}

const PAGE_PERMISSION_PREFIX = 'pages.';

/**
 * Applies the same ownership rules as DepartmentOwnershipGuard and
 * PageSectionOwnershipGuard to a BULK payload.
 *
 * Those guards deliberately authorize a single target per request - resolved
 * from `req.body.departmentId` or one `:id` - so neither can express "every
 * row in this list must be mine". Reorder endpoints take an arbitrary list of
 * ids, which left them as the one write path a scoped admin could use to
 * touch another department's (or another page's) records. This closes that by
 * checking every row, with rules identical to the guards' so there is one
 * definition of ownership rather than two that can drift:
 *
 *  - a super admin is never restricted;
 *  - a department-scoped admin owns only rows carrying their departmentId -
 *    an unowned (null) row is college-wide content and NOT theirs;
 *  - an admin holding any `pages.*` key owns only rows whose pageSection root
 *    is among those keys, and a row with no pageSection is nobody's;
 *  - an admin with neither departmentId nor `pages.*` keys is unrestricted,
 *    which is what keeps super admins and the college-wide roles working.
 *
 * Rejects the whole request rather than reordering the owned subset: a
 * partial reorder would silently produce an ordering the admin never asked
 * for.
 */
export function assertMayReorderAll(
  rows: OwnableRow[],
  admin: RequestAdmin,
): void {
  if (admin.isSuperAdmin) return;

  if (admin.departmentId != null) {
    const foreign = rows.some((row) => row.departmentId !== admin.departmentId);
    if (foreign) {
      throw new ForbiddenException(
        "You can only reorder your own department's records.",
      );
    }
  }

  const allowedRoots = (admin.permissions ?? [])
    .filter((key) => key.startsWith(PAGE_PERMISSION_PREFIX))
    .map((key) => key.slice(PAGE_PERMISSION_PREFIX.length));

  if (allowedRoots.length > 0) {
    const foreign = rows.some(
      (row) =>
        !row.pageSection ||
        !allowedRoots.includes(pageSectionRoot(row.pageSection)),
    );
    if (foreign) {
      throw new ForbiddenException(
        'You can only reorder content on your own pages.',
      );
    }
  }
}
