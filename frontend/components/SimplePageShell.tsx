"use client"

import CmsText from "@/components/CmsText"

/**
 * The hero-and-body shell the smaller CMS-driven pages share.
 *
 * Committees, Policies and Service Rules are the same page with different
 * content: a banner, a line of intro, then whatever the CMS holds. Copying the
 * markup three times would mean three places to fix when the hero changes, and
 * the styles here are lifted verbatim from the Academics index so a new page
 * looks like it belongs rather than merely similar.
 *
 * Every string is a CmsText slot, so the college edits the wording in Page
 * Content without a deploy - which is the point of adding the page at all.
 */
export default function SimplePageShell({
  section,
  titleSlot,
  taglineSlot,
  introSlot,
  banner = "/banners/courses-intake.webp",
  children,
}: {
  /** Page Content section these slots live under, e.g. "policies". */
  section: string
  titleSlot: string
  taglineSlot: string
  /** Body paragraph under the hero. Omit for a page that opens straight in. */
  introSlot?: string
  banner?: string
  children: React.ReactNode
}) {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .sp-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .sp-container { padding: 0 20px; } }
        .sp-hero {
          position: relative; background-image: url('${banner}');
          background-size: cover; background-position: center;
          background-color: #2B3490; padding: 92px 0; overflow: hidden;
        }
        .sp-hero::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(20,26,74,0.72) 0%, rgba(20,26,74,0.86) 100%);
        }
        .sp-hero > * { position: relative; z-index: 2; }
        .sp-title {
          font-family: 'Rajdhani', sans-serif; font-size: clamp(2rem, 4.5vw, 3.4rem);
          font-weight: 700; color: #fff; margin: 0;
        }
        .sp-tagline { color: rgba(255,255,255,0.85); font-size: 18px; margin: 14px 0 0; max-width: 720px; }
        .sp-intro { color: #555; font-size: 16px; line-height: 1.8; margin: 0; max-width: 820px; }
        .sp-heading {
          font-family: 'Rajdhani', sans-serif; font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 700; color: #1a1a2e; margin: 0 0 28px;
        }
      `}</style>

      <section className="sp-hero">
        <div className="sp-container">
          <h1 className="sp-title"><CmsText section={section} slot={titleSlot} /></h1>
          <p className="sp-tagline"><CmsText section={section} slot={taglineSlot} /></p>
        </div>
      </section>

      {introSlot && (
        <section style={{ padding: "56px 0 0" }}>
          <div className="sp-container">
            <p className="sp-intro"><CmsText section={section} slot={introSlot} multiline /></p>
          </div>
        </section>
      )}

      <section style={{ padding: "48px 0 72px" }}>
        <div className="sp-container">{children}</div>
      </section>
    </main>
  )
}
