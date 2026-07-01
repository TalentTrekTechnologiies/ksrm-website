import { notFound } from "next/navigation";
import DepartmentPage from "@/components/DepartmentPage";
import { civil } from "@/data/departments/civil";
import { cse } from "@/data/departments/cse";
import { ece } from "@/data/departments/ece";
import { eee } from "@/data/departments/eee";
import { mech } from "@/data/departments/mech";
import { mba } from "@/data/departments/mba";
import { hs } from "@/data/departments/hs";

const departments = { civil, cse, ece, eee, mechanical: mech, mba, hs, "humanities-sciences": hs };

export function generateStaticParams() {
  return Object.keys(departments).map((slug) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const department = (departments as Record<string, typeof civil>)[slug];
  if (!department) return notFound();
  return <DepartmentPage department={department} />;
}
