"use client";

import SimplePageShell from "@/components/SimplePageShell";
import PageResources from "@/components/PageResources";

/**
 * Faculty Rules.
 *
 * Wording is CmsText and the documents come from Admin -> Documents against
 * "Faculty Rules", so the college publishes here without a deploy. The upload form
 * offers this page's categories as one-click group headings, and each becomes
 * a block on the page - so the page organises itself as documents are added.
 */
export default function Page() {
  return (
    <SimplePageShell
      section="faculty.rules"
      titleSlot="faculty-rules"
      taglineSlot="tagline"
      introSlot="intro"
      banner="/site-images/blocktop.webp"
    >
      {/* A list like this is read by scanning it, so it is not collapsed
          behind a "Show all" toggle at six rows. */}
      <PageResources section="faculty.rules" embedded maxVisible={20} />
    </SimplePageShell>
  );
}
