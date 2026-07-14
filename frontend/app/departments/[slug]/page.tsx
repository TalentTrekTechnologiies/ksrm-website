import { notFound } from "next/navigation";
import DepartmentPage from "@/components/DepartmentPage";
import type { Department } from "@/types/department";
import { civil } from "@/data/departments/civil";
import { cse } from "@/data/departments/cse";
import { ece } from "@/data/departments/ece";
import { eee } from "@/data/departments/eee";
import { mech } from "@/data/departments/mech";
import { mba } from "@/data/departments/mba";
import { hs } from "@/data/departments/hs";

// No hardcoded content exists yet for these two - they launch as empty CMS
// records (per the Department CMS phase decision) and DepartmentPage's own
// client-side fetch fills everything in from the backend.
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

const aids = emptyDepartment("aids", "Artificial Intelligence & Data Science", "AI & DS");
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
  aids,
  mca,
};

export function generateStaticParams() {
  return Object.keys(departments).map((slug) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const department = (departments as Record<string, typeof civil>)[slug];
  if (!department) return notFound();
  return <DepartmentPage department={department} />;
}
