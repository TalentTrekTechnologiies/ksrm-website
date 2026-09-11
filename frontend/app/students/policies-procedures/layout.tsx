import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

/**
 * The page itself is a client component, which cannot export metadata - so it
 * lives here, the pattern the rest of the site already uses.
 *
 * Without it these pages inherited the root layout's title, so every one of
 * them read "K.S.R.M. College of Engineering, Kadapa | KSRMCE" in the browser
 * tab and in search results. These URLs are handed to NAAC and NBA reviewers
 * directly; a page that does not say what it is undermines the link.
 */
export const metadata: Metadata = pageMetadata({
  title: "Student Policies & Procedures",
  description: "Policies and procedures for students at K.S.R.M. College of Engineering, Kadapa - admission, attendance, conduct, examinations and grievances.",
  path: "/students/policies-procedures",
})

export default function RouteLayout({ children }: { children: React.ReactNode }) {
  return children
}
