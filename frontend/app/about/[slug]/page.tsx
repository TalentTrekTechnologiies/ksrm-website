import { notFound } from "next/navigation"
import LeadershipProfile from "@/components/about/LeadershipProfile"
import { leaders, leadershipOrder } from "@/components/about/leaders"

export async function generateStaticParams() {
  return leadershipOrder.map((slug) => ({
    slug,
  }))
}

interface LeadershipPageProps {
  params: Promise<{ slug: string }>
}

export default async function LeadershipPage({ params }: LeadershipPageProps) {
  const { slug } = await params

  const leader = leaders[slug]
  if (!leader) {
    notFound()
  }

  return <LeadershipProfile leader={leader} />
}
