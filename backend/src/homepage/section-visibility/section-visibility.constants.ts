// The 6 homepage sections built in Sprint 1C, and only these - retrofitting
// this same toggle onto 1A/1B's sections (Hero, Statistics, Quick Links,
// Vision, Mission, About, Admissions) is a deliberate fast-follow, not done
// here (see the Sprint 1C plan's "Key decisions" #7 and the
// feedback_section_visibility memory).
export const SECTION_VISIBILITY_KEYS = [
  'testimonials',
  'campusVideos',
  'accreditation',
  'recruiters',
  'departments',
  'latestNews',
] as const;

export type SectionVisibilityKey = (typeof SECTION_VISIBILITY_KEYS)[number];

export function settingKeyFor(section: SectionVisibilityKey): string {
  return `homepage.visibility.${section}`;
}
