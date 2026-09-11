import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { loadCmsCommittees, cmsCommitteeSlugs, committeeSlug } from "@/lib/committees-build";
import CommitteePage from "@/components/committees/CommitteePage";

/**
 * One page per committee, so each has a URL of its own.
 *
 * The college cites these in NAAC and NBA submissions, where an anchor into a
 * shared page is not good enough: a reviewer cannot bookmark it, it moves when
 * the page is reordered, and it gives no title of its own in search results or
 * in a citation. /committees/finance-committee is a real page.
 *
 * Built from the CMS, so creating a committee produces its page on the next
 * build with no code change - the same arrangement the department pages use.
 */
export async function generateStaticParams() {
  return (await cmsCommitteeSlugs()).map((slug) => ({ slug }));
}

async function committeeFor(slug: string) {
  const all = await loadCmsCommittees();
  return all.find((c) => c.isActive !== false && committeeSlug(c.name) === slug) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const committee = await committeeFor(slug);
  if (!committee) return {};

  return pageMetadata({
    title: committee.name,
    description:
      committee.description?.trim() ||
      `${committee.name} at K.S.R.M. College of Engineering, Kadapa - members, constitution and minutes of meetings.`,
    path: `/committees/${slug}`,
  });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const committee = await committeeFor(slug);

  // The name and description are baked in from the build so the page has a
  // heading before any JavaScript runs - which is what a search engine and a
  // NAAC reviewer opening the link actually see. The roster and the minutes
  // are fetched live by the client component, so editing them in the CMS shows
  // up without a rebuild.
  return (
    <CommitteePage
      slug={slug}
      fallbackName={committee?.name ?? ""}
      fallbackDescription={committee?.description ?? null}
    />
  );
}
