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

export function generateStaticParams() {
  return [...Object.keys(departments), ...CSE_ALIASES].map((slug) => ({ slug }));
}

// Per-department SEO: without this every department page inherited the root
// layout's generic homepage title/description. Now each gets a unique title +
// description + canonical, which is what people actually search for ("KSRM CSE
// department", etc.).
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const department = (departments as Record<string, typeof civil>)[slug];
  if (!department) return {};
  const description =
    department.tagline ||
    (department.about ? department.about.slice(0, 155) : `${department.name} at K.S.R.M. College of Engineering, Kadapa.`);
  const title = `${department.name} | K.S.R.M. College of Engineering`;
  return {
    title,
    description,
    alternates: { canonical: `/departments/${slug}` },
    openGraph: { title, description, url: `/departments/${slug}` },
    twitter: { title, description },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (CSE_ALIASES.has(slug)) redirect("/departments/cse");
  const department = (departments as Record<string, typeof civil>)[slug];
  if (!department) return notFound();
  return <DepartmentPage department={department} />;
}
