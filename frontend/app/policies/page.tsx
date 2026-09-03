"use client";

import SimplePageShell from "@/components/SimplePageShell";
import PageResources from "@/components/PageResources";

/**
 * The college's policy documents, grouped by the category an admin chose.
 *
 * The category is the document's group heading, offered as one-click buttons
 * in the upload form (see GROUP_SUGGESTIONS in lib/downloads-api.ts) rather
 * than a fixed dropdown - a new category is then an admin decision instead of
 * a code change, which is how every other grouping on this site works.
 *
 * PageResources renders one block per category, so the page organises itself:
 * upload three documents under "Academic Policies" and that heading appears
 * with three documents beneath it.
 */
export default function PoliciesPage() {
  return (
    <SimplePageShell
      section="policies"
      titleSlot="policies"
      taglineSlot="the-policies-that-govern-college"
      introSlot="k-s-r-m-college"
      banner="/site-images/blocktop.webp"
    >
      <PageResources
        section="policies"
        embedded
        // Higher than the default six: a policy list is read by scanning it,
        // and a "Show all" toggle between a reader and a policy they are
        // looking for is friction with nothing to gain - these blocks are
        // short by nature.
        maxVisible={20}
      />
    </SimplePageShell>
  );
}
