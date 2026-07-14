import { Suspense } from "react"
import PreviewRenderer from "@/components/admin/homepage/PreviewRenderer"

const PREVIEW_KEYS = ["hero", "vision", "mission", "about", "admissions"]

export function generateStaticParams() {
  return PREVIEW_KEYS.map((key) => ({ key }))
}

export default async function HomepagePreviewPage({
  params,
}: {
  params: Promise<{ key: string }>
}) {
  const { key } = await params
  return (
    // PreviewRenderer reads useSearchParams() for the draft payload - Next
    // requires that to be inside a Suspense boundary for static export.
    <Suspense fallback={null}>
      <PreviewRenderer previewKey={key} />
    </Suspense>
  )
}
