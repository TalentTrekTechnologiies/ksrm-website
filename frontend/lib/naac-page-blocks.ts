import type { DocBlockRules, PageDocBlock } from "@/lib/page-doc-rules"
import { NAAC_TABS } from "@/lib/naac-tabs"

/**
 * The document blocks of the public NAAC page, in the outline's order.
 *
 * The page passes these to its PageResources blocks, and the admin lists the
 * same blocks from the same rules. Most of the page's files are old-site
 * migrations left in the broad "naac" section and pulled into DVV, SSR, AAA
 * and the rest by heading or title - so an admin view that only matched the
 * section name showed "No documents" under sections full of files.
 */

// Title and group patterns, as regex SOURCES (PageResources compiles them,
// case-insensitively). Each section pulls the migrated documents that match;
// "Other NAAC Documents" leaves out all of them.
//
// Minutes: "minutes", not "minute" - a NAAC document titled "1 One minute
// talk" is not a set of minutes; \bmom\b avoids "moment".
export const MINUTES_TITLE = "minutes|\\bmom\\b|agenda"
const MINUTES_FALLBACK_SECTIONS = ["iqac", "iqac.aqar", "naac"]
const DVV_GROUP = "^dvv\\d*$"
const DVV_TITLE = "\\bdvv\\b"
const SSR_GROUP = "^ssr$"
const SSR_TITLE = "\\bssr\\b|self[\\s-]*study"
const AAA_TITLE = "academic.{0,30}audit|\\baaa\\b"
const CODE_TITLE = "code of (conduct|ethic)"
const POLICY_TITLE = "\\bpolic(y|ies)\\b|hand ?book"
const FEEDBACK_TITLE = "feedback"
const BEST_TITLE = "best practice"
const DISTINCT_TITLE = "distinctive"
const CLAIMED_TITLES = [DVV_TITLE, SSR_TITLE, MINUTES_TITLE, AAA_TITLE, CODE_TITLE, POLICY_TITLE, FEEDBACK_TITLE, BEST_TITLE, DISTINCT_TITLE].join("|")
const CLAIMED_GROUPS = "^(dvv\\d*|ssr)$"
const NAAC_ONLY = ["naac"]

const RULES: Record<string, DocBlockRules> = {
  // Minutes filed under AQAR during the migration show under Minutes.
  aqars: { section: "iqac.aqar", leaveOut: { titlePattern: MINUTES_TITLE } },
  ssr: { section: "naac.ssr", fallbackSections: NAAC_ONLY, fallbackGroupPattern: SSR_GROUP, fallbackTitlePattern: SSR_TITLE },
  dvv: { section: "naac.dvv", fallbackSections: NAAC_ONLY, fallbackGroupPattern: DVV_GROUP, fallbackTitlePattern: DVV_TITLE },
  minutes: { section: "iqac.minutes", fallbackSections: MINUTES_FALLBACK_SECTIONS, fallbackTitlePattern: MINUTES_TITLE },
  survey: { section: "iqac.survey" },
  aaa: { section: "naac.aaa", fallbackSections: NAAC_ONLY, fallbackTitlePattern: AAA_TITLE },
  "code-of-conduct": { section: "naac.code-of-conduct", fallbackSections: NAAC_ONLY, fallbackTitlePattern: CODE_TITLE },
  policies: { section: "naac.policies", fallbackSections: NAAC_ONLY, fallbackTitlePattern: POLICY_TITLE },
  feedback: { section: "naac.feedback", fallbackSections: NAAC_ONLY, fallbackTitlePattern: FEEDBACK_TITLE },
  "best-practices": { section: "naac.best-practices", fallbackSections: NAAC_ONLY, fallbackTitlePattern: BEST_TITLE },
  distinctiveness: { section: "naac.distinctiveness", fallbackSections: NAAC_ONLY, fallbackTitlePattern: DISTINCT_TITLE },
  "annual-reports": { section: "iqac.annualreports" },
  // Whatever no section above claims - the criteria-wise evidence the old
  // site was organised by.
  other: { section: "naac", leaveOut: { groupPattern: CLAIMED_GROUPS, titlePattern: CLAIMED_TITLES } },
}

export const NAAC_DOC_BLOCKS: PageDocBlock[] = [
  ...NAAC_TABS.filter((t) => RULES[t.id]).map((t) => ({ id: t.id, title: t.label, anchor: t.id, rules: RULES[t.id] })),
  { id: "other", title: "Other NAAC Documents", anchor: "other-naac-documents", rules: RULES.other },
]

/** One block's rules, for spreading into <PageResources>. */
export function naacBlockRules(id: string): DocBlockRules {
  const rules = RULES[id]
  if (!rules) throw new Error(`Unknown NAAC block "${id}"`)
  return rules
}
