/**
 * The document the labs and the optimiser both test against.
 *
 * Prose alone was a bad fixture. An accreditation document is mostly headings,
 * figures and tables, and those degrade differently from a paragraph: OCR
 * recovers a mangled word from context and cannot do the same for "3.4.2" or
 * "182". A protection setting that leaves the prose readable while destroying
 * the numbers is not a success, and measuring only prose would have called it
 * one.
 *
 * So the fixture carries all five, each scored separately.
 */
export interface FixturePart {
  id: "heading" | "paragraph" | "small" | "numbers" | "table"
  label: string
  /** What the part should read as, for scoring. */
  text: string
}

export const FIXTURE: FixturePart[] = [
  {
    id: "heading",
    label: "Heading",
    text: "Criterion 3 Research Innovations and Extension",
  },
  {
    id: "paragraph",
    label: "Body paragraph",
    text: `The institution provides incentives to teachers who receive state, national and international recognition for research contributions. Supporting documents for the assessment period are enclosed, including sanction letters, utilisation certificates and the audited statement of accounts for each financial year under review.`,
  },
  {
    id: "small",
    label: "Small print",
    text: `Figures are reconciled against the annual accounts certified by the statutory auditor. Amounts are stated in Indian rupees and rounded to the nearest thousand.`,
  },
  {
    id: "numbers",
    label: "Figures",
    text: `Sanctioned 4820000 Utilised 4617500 Balance 202500 Projects 37 Patents 12 Publications 284`,
  },
  {
    id: "table",
    label: "Table",
    text: `2021-22 18 42 1260000 2022-23 24 61 1845000 2023-24 31 77 2410000 2024-25 37 84 2905000`,
  },
]

/** Everything, for a single combined score. */
export const FIXTURE_TEXT = FIXTURE.map((f) => f.text).join(" ")
