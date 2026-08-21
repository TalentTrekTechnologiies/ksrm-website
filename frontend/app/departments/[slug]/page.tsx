import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import DepartmentPage from "@/components/DepartmentPage";
import type { Department } from "@/types/department";
import { civil } from "@/data/departments/civil";
import { cse } from "@/data/departments/cse";
import { ece } from "@/data/departments/ece";
import { eee } from "@/data/departments/eee";
import { mech } from "@/data/departments/mech";
import { mba } from "@/data/departments/mba";
import { hs } from "@/data/departments/hs";
import { CourseListJsonLd } from "@/components/seo/JsonLd";
import RouteBreadcrumbs from "@/components/seo/RouteBreadcrumbs";
import { pageMetadata } from "@/lib/seo";
import { cmsDepartment, cmsDepartmentSlugs } from "@/lib/departments-build";

// MCA launches as an empty CMS record (per the Department CMS phase decision);
// DepartmentPage's own client-side fetch fills it in from the backend.
//
// There is deliberately no "aids" entry: AI & ML and Data Science are
// specialisations offered *under CSE*, not a separate department, so they are
// listed as CSE programmes and /departments/aids redirects to /departments/cse
// rather than rendering an empty department shell.
function emptyDepartment(slug: string, name: string, shortName: string): Department {
  return {
    slug,
    name,
    shortName,
    tagline: "",
    about: "Department content is being populated by the administration.",
    vision: "",
    mission: [],
    peos: [],
    pos: [],
    psos: [],
    aiHighlights: [],
    hod: { name: "", designation: "", qualification: "", message: [], photo: "", email: "" },
    faculty: [],
    programmes: [],
    labs: [],
    heroImage: "",
  };
}

const mca = emptyDepartment("mca", "Master of Computer Applications", "MCA");

const departments = {
  civil,
  cse,
  ece,
  eee,
  mechanical: mech,
  mech: mech,
  mba,
  hs,
  "humanities-sciences": hs,
  mca,
};

// AI & ML / Data Science are CSE specialisations - keep the old URLs working by
// sending them to the CSE department rather than 404ing.
const CSE_ALIASES = new Set(["aids", "ai-ds", "aiml", "ai-ml", "data-science", "cse-ds", "cse-aiml"]);

/**
 * Slugs that render the same department under a second URL. `mech` and `hs` are
 * the canonical forms; these are kept working for old inbound links.
 */
const DUPLICATE_SLUGS = new Set(["mechanical", "humanities-sciences"]);

/**
 * The canonical slug set - and ONLY that set.
 *
 * The alias slugs used to be built too, which under `output: "export"` was
 * counterproductive in two different ways:
 *
 *   - the 7 CSE aliases call redirect(), and a static export cannot emit an
 *     HTTP 301 for that. It emitted a 14 KB HTML page returning **200** with
 *     the generic homepage title, no <h1> and no canonical - seven thin,
 *     indexable near-duplicates.
 *   - /departments/mechanical/ and /departments/humanities-sciences/ were full
 *     copies of /departments/mech/ and /departments/hs/, each canonicalising to
 *     *itself*, i.e. textbook duplicate content.
 *
 * Not building them means no file exists at those paths, so the real 301s in
 * netlify.toml and deploy/nginx-redirects.conf handle them at the edge - which
 * is where a redirect belongs. The maps below stay so the route still resolves
 * correctly in `next dev`, where redirect() does work.
 */
export async function generateStaticParams() {
  const inCode = Object.keys(departments).filter((slug) => !DUPLICATE_SLUGS.has(slug));

  // Everything the CMS has as well, so a department created by an admin gets a
  // real page on the next build. Without this the page set was whatever this
  // file happened to list, and a department added in the CMS produced no page
  // at all - the URL then answered 200 with the homepage, because nginx serves
  // /index.html for unknown paths. Nothing anywhere said "that page does not
  // exist"; it simply looked like the CMS had not saved.
  //
  // A CMS-only department renders the same empty shell MCA does and fills
  // itself in from the API client-side, so it needs no content in this file.
  const fromCms = await cmsDepartmentSlugs();

  return [...new Set([...inCode, ...fromCms])].map((slug) => ({ slug }));
}

/**
 * The department behind a slug: the one written in this file if there is one,
 * otherwise a shell built from the CMS record.
 *
 * A department created in the CMS has no entry above, and both entry points
 * used to treat that as "no such department" - generateMetadata returned {}
 * and the page called notFound(). The shell is what MCA already renders:
 * DepartmentPage matches the slug against the API client-side and fills in the
 * profile, HoD, faculty, programmes and labs from the CMS, so the only thing
 * needed here is a correctly-named placeholder to hang that off.
 */
async function resolveDepartment(slug: string): Promise<Department | null> {
  const inCode = (departments as Record<string, Department>)[slug];
  if (inCode) return inCode;

  const cms = await cmsDepartment(slug);
  if (!cms || cms.isActive === false) return null;

  const name = cms.name?.trim() || slug;
  return emptyDepartment(slug, name, cms.shortName?.trim() || name);
}

// Per-department SEO: without this every department page inherited the root
// layout's generic homepage title/description. Now each gets a unique title +
// description + canonical, which is what people actually search for ("K.S.R.M. CSE
// department", etc.).
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const department = await resolveDepartment(slug);
  if (!department) return {};

  const cms = await cmsDepartment(slug);

  if (cms?.metaTitle?.trim() || cms?.metaDescription?.trim()) {
    return pageMetadata({
      title: cms.metaTitle?.trim() || department.name,
      description:
        cms.metaDescription?.trim() ||
        department.tagline?.trim() ||
        `${department.name} at K.S.R.M. College of Engineering, Kadapa.`,
      path: `/departments/${slug}`,
      image: cms.ogImageUrl?.trim() || department.heroImage || undefined,
    });
  }

  // No override set: build the description from the page's own content. A
  // tagline is marketing copy, often under 60 characters - too thin to earn a
  // click on its own - so it is topped up from the About text, and the college
  // and city are always named, which is how these are searched for
  // ("KSRM CSE department Kadapa").
  const tagline = department.tagline?.trim();
  const about = department.about?.trim().replace(/\s+/g, " ");
  let description = [tagline, about].filter(Boolean).join(" ");
  if (description.length > 158) description = `${description.slice(0, 158).replace(/[\s,;]+\S*$/, "")}…`;
  if (!description) description = `${department.name} at K.S.R.M. College of Engineering, Kadapa.`;

  // Aliases are not built (see generateStaticParams), so `slug` here is always
  // canonical and the canonical URL is self-referencing.
  return pageMetadata({
    title: department.name,
    description,
    path: `/departments/${slug}`,
    image: department.heroImage || undefined,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Only reachable in `next dev`; the static export does not build these paths
  // and the edge 301s handle them in production.
  if (CSE_ALIASES.has(slug)) redirect("/departments/cse");
  const department = await resolveDepartment(slug);
  if (!department) return notFound();

  return (
    <>
      {/*
        Derived from the real URL (Home > Departments > CSE). An earlier draft
        inserted an "Academics" crumb, but the department pages do not live
        under /academics/ - a breadcrumb trail that claims a hierarchy the URLs
        do not have is exactly the mismatch Google's guidance warns about.
      */}
      <RouteBreadcrumbs path={`/departments/${slug}`} currentLabel={department.name} />
      {/* Only the programmes this department actually lists on the page. */}
      <CourseListJsonLd
        departmentName={department.name}
        courses={(department.programmes ?? []).map((p) => ({
          name: p.name,
          level: p.level || undefined,
        }))}
      />
      <DepartmentPage department={department} />
    </>
  );
}
