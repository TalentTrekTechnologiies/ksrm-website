import { notFound } from "next/navigation"
import DepartmentTemplate from "@/components/departments/DepartmentTemplate"
import { departments, departmentOrder } from "@/data/departments"

export async function generateStaticParams() {
  return departmentOrder.map((slug) => ({
    slug,
  }))
}

interface DepartmentPageProps {
  params: Promise<{ slug: string }>
}

export default async function DepartmentPage({ params }: DepartmentPageProps) {
  const { slug } = await params

  const department = departments[slug]
  if (!department) {
    notFound()
  }

  return <DepartmentTemplate department={department} />
}
