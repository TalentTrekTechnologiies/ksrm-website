"use client";

import SimplePageShell from "@/components/SimplePageShell";
import PageResources from "@/components/PageResources";

/**
 * Student Rules.
 *
 * Wording is CmsText and the documents come from Admin -> Documents against
 * "Student Rules", so the college publishes here without a deploy. The upload form
 * offers this page's categories as one-click group headings, and each becomes
 * a block on the page - so the page organises itself as documents are added.
 */
export default function Page() {
  return (
    <SimplePageShell
      section="students.rules"
      titleSlot="student-rules"
      taglineSlot="tagline"
      introSlot="intro"
      banner="/site-images/blocktop.webp"
    >
      {/* A list like this is read by scanning it, so it is not collapsed
          behind a "Show all" toggle at six rows. */}
      <PageResources section="students.rules" embedded maxVisible={20} />
    </SimplePageShell>
  );
}
