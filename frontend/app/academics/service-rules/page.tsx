"use client";

import SimplePageShell from "@/components/SimplePageShell";
import PageResources from "@/components/PageResources";

/**
 * Service rules for the college's staff: the conditions of service, and the
 * documents that set them out.
 *
 * The wording is CmsText, so the college edits it in Page Content without a
 * deploy, and the documents come from Admin -> Documents against
 * "Academics -> Service Rules" - which accepts .docx as well as PDF, since
 * these circulate as Word documents.
 */
export default function ServiceRulesPage() {
  return (
    <SimplePageShell
      section="academics.service-rules"
      titleSlot="service-rules"
      taglineSlot="conditions-of-service-for-staff"
      introSlot="k-s-r-m-college"
    >
      <PageResources section="academics.service-rules" embedded maxVisible={20} />
    </SimplePageShell>
  );
}
