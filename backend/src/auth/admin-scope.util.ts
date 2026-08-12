import { RequestAdmin } from '../homepage/types';

const PAGE_PERMISSION_PREFIX = 'pages.';

/**
 * Prisma `where` fragment restricting a LIST to what an admin owns.
 *
 * The two ownership guards cover writes, one target at a time. They say
 * nothing about reads, so a page- or department-scoped admin could still SEE
 * every row in a module - a Library admin opening Documents got every NAAC and
 * exam PDF on the site, and merely failed with a 403 on trying to edit one.
 * "Can only change what's theirs" is not the same promise as "can only see
 * what's theirs", and the second is the one that was asked for.
 *
 * Derived from req.user, never from a query parameter, so it cannot be widened
 * by editing the URL. Rules match the guards exactly:
 *
 *  - super admin: unrestricted;
 *  - department-scoped admin: only their department's rows (an unowned row is
 *    college-wide content and not theirs, same as the guard's reversed null
 *    rule);
 *  - page-scoped admin: only rows on their pages;
 *  - both: the intersection, which is what a scoped admin holding a pages.*
 *    key should see;
 *  - neither: unrestricted.
 *
 * `opts` says which columns the model actually has, so a model without
 * pageSection is never handed a pageSection filter.
 */
export function adminScopeWhere(
  admin: RequestAdmin | undefined,
  opts: { department?: boolean; page?: boolean } = {},
): Record<string, unknown> {
  if (!admin || admin.isSuperAdmin) return {};

  const clauses: Record<string, unknown>[] = [];

  if (opts.department && admin.departmentId != null) {
    clauses.push({ departmentId: admin.departmentId });
  }

  if (opts.page) {
    const roots = (admin.permissions ?? [])
      .filter((key) => key.startsWith(PAGE_PERMISSION_PREFIX))
      .map((key) => key.slice(PAGE_PERMISSION_PREFIX.length));

    if (roots.length > 0) {
      // A root owns its own section and every sub-section beneath it:
      // `examinations` covers `examinations` and `examinations.timetables`.
      // Matched as an exact value OR a `root.` prefix rather than a bare
      // startsWith, so `examinations` cannot also swallow an unrelated
      // section that merely begins with those letters.
      clauses.push({
        OR: roots.flatMap((root) => [
          { pageSection: root },
          { pageSection: { startsWith: `${root}.` } },
        ]),
      });
    }
  }

  if (clauses.length === 0) return {};
  if (clauses.length === 1) return clauses[0];
  return { AND: clauses };
}
