/**
 * Departments whose CMS slug differs from the URL the site publishes.
 *
 * The CMS calls Mechanical "mechanical" and Humanities & Sciences
 * "humanities-sciences", while the public URLs are /departments/mech and
 * /departments/hs. Both spellings resolve to the same department, so only one
 * may be BUILT - otherwise the two URLs are the same page with the same title
 * and description, each canonicalising to itself, which is textbook duplicate
 * content. The route has excluded the alias forms from the build for that
 * reason since well before the CMS drove any of this.
 *
 * Anything that turns a CMS record into a link has to map through here, or it
 * points at a URL the build deliberately does not produce - and since nginx
 * serves /index.html for unknown paths, that link would quietly open the
 * homepage instead of 404ing.
 *
 * Deliberately dependency-free so the build-time loader and the client
 * navigation can share it.
 */
export const DEPARTMENT_SLUG_ALIASES: Readonly<Record<string, string>> = {
  mechanical: "mech",
  "humanities-sciences": "hs",
};

/** The URL slug for a department, given any spelling of it. */
export function canonicalDepartmentSlug(slug: string): string {
  const key = slug.trim().toLowerCase();
  return DEPARTMENT_SLUG_ALIASES[key] ?? slug;
}
