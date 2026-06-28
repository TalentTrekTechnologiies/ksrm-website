import { Metadata } from "next"
import DepartmentTemplate from "@/components/departments/DepartmentTemplate"
import { departments } from "@/data/departments"

export const dynamicParams = true

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const department = departments[params.slug as keyof typeof departments]

  if (!department) {
    return {
      title: "Department Not Found | KSRM College of Engineering",
    }
  }

  return {
    title: `${department.name} | KSRM College of Engineering`,
    description: department.about,
  }
}

export default function DepartmentPage({
  params,
}: {
  params: { slug: string }
}) {
  const department = departments[params.slug as keyof typeof departments]

  if (!department) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <h1>Department Not Found</h1>
        <p>The requested department does not exist.</p>
      </div>
    )
  }

  return <DepartmentTemplate department={department} />
}
