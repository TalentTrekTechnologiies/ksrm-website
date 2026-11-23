"use client"

import { getSectionPublic, VisionContent, MissionContent } from "@/lib/homepage-api"
import { useLiveData } from "@/lib/use-live-data"

/**
 * The college's Vision & Mission - one record, edited in Admin -> Homepage ->
 * Vision / Mission, shown on the homepage AND the About page.
 *
 * The About page used to carry its own copy (the vision as page text, the
 * three missions written into the code), which nobody could edit there and
 * which still had the old wording after the college revised both in
 * September 2026. Reading the same record keeps the two pages identical.
 *
 * The fallbacks are the current wording, shown only if the CMS cannot be
 * reached - so a slow load never flashes the old statements.
 */
export const FALLBACK_VISION: VisionContent = {
  eyebrow: "Who We Are",
  heading: "Our Vision & Mission",
  label: "Our Vision",
  text: "To emerge as a centre of excellence in technical education and research, nurturing psychologically strong, socially responsible and globally competent professionals for sustainable development.",
}

export const FALLBACK_MISSION: MissionContent = {
  label: "Our Mission",
  missions: [
    {
      code: "M1",
      text: "To provide multidisciplinary education through enriched curricula, emerging technologies and effective pedagogical practices.",
    },
    {
      code: "M2",
      text: "To foster research, innovation and entrepreneurship through industry-academia linkage.",
    },
    {
      code: "M3",
      text: "To instill leadership skills and ethical values among professionals through community engagement, contributing to the development of society and the nation.",
    },
  ],
}

export interface VisionMission {
  vision: VisionContent
  mission: MissionContent
}

export async function fetchVisionMission(): Promise<VisionMission> {
  const [visionSection, missionSection] = await Promise.all([
    getSectionPublic("vision"),
    getSectionPublic("mission"),
  ])
  return {
    vision: visionSection?.content ?? FALLBACK_VISION,
    mission: missionSection?.content ?? FALLBACK_MISSION,
  }
}

/** The live Vision & Mission; the fallback until (or unless) the CMS answers. */
export function useVisionMission(options?: { skip?: boolean }): VisionMission {
  const live = useLiveData(fetchVisionMission, [], { skip: options?.skip })
  return {
    vision: live?.vision ?? FALLBACK_VISION,
    mission: live?.mission ?? FALLBACK_MISSION,
  }
}
