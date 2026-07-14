"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Hero from "@/components/home/Hero"
import VisionMissionTabs from "@/components/home/VisionMissionTabs"
import AboutPreview from "@/components/home/AboutPreview"
import Admissions from "@/components/home/Admissions"
import {
  getSectionPublic,
  getAdmissionProgramsPublic,
  HomepageHero,
  VisionContent,
  MissionContent,
  AboutContent,
  AdmissionsContent,
  AdmissionProgram,
} from "@/lib/homepage-api"

function decodeDraft<T>(encoded: string | null): T | null {
  if (!encoded) return null
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)))
  } catch {
    return null
  }
}

/**
 * Renders the real public component this preview key corresponds to, fed
 * the editor's in-progress draft (decoded from the `draft` query param)
 * instead of fetching from the API - this is what CmsPreviewPanel's iframe
 * points at, so Desktop/Tablet/Mobile tabs get each component's actual
 * `@media` breakpoints (a real browsing context, not a scaled-down div).
 */
export default function PreviewRenderer({ previewKey }: { previewKey: string }) {
  const searchParams = useSearchParams()
  const draft = searchParams.get("draft")

  // Vision/Mission render together in one component - editing one still
  // needs the other's current live content for a faithful preview.
  const [siblingMission, setSiblingMission] = useState<MissionContent | null>(null)
  const [siblingVision, setSiblingVision] = useState<VisionContent | null>(null)
  const [programs, setPrograms] = useState<AdmissionProgram[] | null>(null)

  useEffect(() => {
    if (previewKey === "vision") {
      getSectionPublic("mission").then((s) => setSiblingMission(s?.content ?? null))
    } else if (previewKey === "mission") {
      getSectionPublic("vision").then((s) => setSiblingVision(s?.content ?? null))
    } else if (previewKey === "admissions") {
      getAdmissionProgramsPublic().then(setPrograms)
    }
  }, [previewKey])

  if (previewKey === "hero") {
    const heroDraft = decodeDraft<HomepageHero>(draft)
    return heroDraft ? <Hero previewData={heroDraft} /> : <p className="p-6 text-sm text-slate-500">No preview data.</p>
  }

  if (previewKey === "vision") {
    const visionDraft = decodeDraft<VisionContent>(draft)
    if (!visionDraft) return <p className="p-6 text-sm text-slate-500">No preview data.</p>
    return <VisionMissionTabs previewData={{ vision: visionDraft, mission: siblingMission ?? undefined }} />
  }

  if (previewKey === "mission") {
    const missionDraft = decodeDraft<MissionContent>(draft)
    if (!missionDraft) return <p className="p-6 text-sm text-slate-500">No preview data.</p>
    return <VisionMissionTabs previewData={{ vision: siblingVision ?? undefined, mission: missionDraft }} />
  }

  if (previewKey === "about") {
    const aboutDraft = decodeDraft<AboutContent>(draft)
    return aboutDraft ? <AboutPreview previewData={aboutDraft} /> : <p className="p-6 text-sm text-slate-500">No preview data.</p>
  }

  if (previewKey === "admissions") {
    const admissionsDraft = decodeDraft<AdmissionsContent>(draft)
    if (!admissionsDraft) return <p className="p-6 text-sm text-slate-500">No preview data.</p>
    return <Admissions previewData={{ admissions: admissionsDraft, programs: programs ?? undefined }} />
  }

  return <p className="p-6 text-sm text-slate-500">Unknown preview key &quot;{previewKey}&quot;.</p>
}
