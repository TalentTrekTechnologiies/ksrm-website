"use client";

import { getPublicSiteSettings } from "@/lib/site-settings-api";
import { useLiveData } from "@/lib/use-live-data";
import { formatAcademicYear } from "@/lib/academic-year";

/**
 * The current academic year, overridable from the CMS.
 *
 * It was typed into the page, so it was right for a year and then quietly
 * wrong. Deriving it from the date fixed that, but a derived value cannot be
 * corrected either - and a college may well need to: a session that opens late,
 * a transition year, or simply a different convention for what to call it.
 *
 * So: Site Settings wins when set, the derived value otherwise. Whoever needs
 * to change it can, and if nobody ever touches it the page still keeps up on
 * its own.
 */
export const ACADEMIC_YEAR_SETTING = "site.academicYear";

export function useAcademicYear(): string {
  const settings = useLiveData<Record<string, string>>(() => getPublicSiteSettings(), [], {
    initialValue: {},
  });
  return settings?.[ACADEMIC_YEAR_SETTING]?.trim() || formatAcademicYear();
}

export default function AcademicYear() {
  return <>{useAcademicYear()}</>;
}
