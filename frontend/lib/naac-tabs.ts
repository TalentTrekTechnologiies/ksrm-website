/**
 * The NAAC page's sections, in the order the college's IQAC outline gives them.
 *
 * One list for the page (tab bar, section ids, headings) and the CMS (each
 * label is editable as `tabs.<id>` under Page Content -> NAAC), so the two
 * cannot drift. `id` is permanent: it is both the page anchor (/naac#dvv) and
 * the stored slot key, so renaming a tab means editing its label, never its id.
 */
export const NAAC_TABS = [
  { id: "accreditation-letter", label: "Accreditation Letter" },
  { id: "aqars", label: "AQARs" },
  { id: "dvv", label: "DVV" },
  { id: "ssr", label: "SSR" },
  { id: "minutes", label: "Minutes of Meeting" },
  { id: "survey", label: "Student Satisfaction Survey" },
  { id: "aaa", label: "Academic & Administrative Audit (AAA)" },
  { id: "code-of-conduct", label: "Code of Conduct" },
  { id: "policies", label: "Policies and Handbooks" },
  { id: "feedback", label: "Stakeholders Feedback" },
  { id: "best-practices", label: "Best Practices" },
  { id: "distinctiveness", label: "Institutional Distinctiveness" },
  { id: "annual-reports", label: "Annual Reports" },
] as const;

export type NaacTabId = (typeof NAAC_TABS)[number]["id"];

/**
 * Feedback forms, moved here with Stakeholders Feedback from the IQAC page.
 * Labels only; each form's URL is set in Page Content -> NAAC, and a form with
 * no URL is not shown.
 */
export const NAAC_FEEDBACK_FORMS = [
  "Alumni Feedback",
  "Student Feedback",
  "Parent Feedback",
  "Teacher Feedback",
  "Employer Feedback",
] as const;
