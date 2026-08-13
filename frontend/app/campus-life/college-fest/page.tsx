import type { Metadata } from "next";
import CmsText from "@/components/CmsText";
import PageResources from "@/components/PageResources";
import CollegeFest from "@/components/campus/CollegeFest";
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "College Fest",
  description: "KONNECT 2K26 and the KSNR Trophy - the annual national-level techno-cultural fest and sports championship at K.S.R.M. College of Engineering, Kadapa.",
  path: "/campus-life/college-fest",
});

/**
 * The college fest, as its own Campus Life sub-page.
 *
 * It began as a block on the Campus Life landing page, which is where the
 * college first asked for it, and it has outgrown that: a fest has dates, a
 * convener, a prize pool, its own posters and its own photographs, and none of
 * that belongs squeezed between twelve navigation cards. Every other thing
 * under Campus Life - Sports, Cultural, NSS, Hostels - is a page, so this is
 * one too.
 *
 * The fest itself comes from Admin -> Events, so next year's replaces this
 * year's without a code change. See CollegeFest.
 */
export default function CollegeFestPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .cf-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .cf-container { padding: 0 32px; } }
        @media (max-width: 768px)  { .cf-container { padding: 0 20px; } }
        @media (max-width: 480px)  { .cf-container { padding: 0 14px; } }

        .cf-hero {
          position: relative; background-image: url('/banners/cultural.webp');
          background-size: cover; background-position: center; background-color: #2B3490;
          min-height: 320px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden;
        }
        .cf-hero::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%); z-index: 1;
        }
        .cf-hero > * { position: relative; z-index: 2; }
        .cf-title {
          font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700; color: #fff; margin: 0; line-height: 1.08;
          text-shadow: 0 2px 12px rgba(0,0,0,0.7);
        }
        .cf-subtitle {
          color: rgba(255,255,255,0.95); font-size: 19px; margin: 16px 0 0;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6); max-width: 760px;
        }
        .cf-intro { font-size: 17px; color: #555; line-height: 1.85; max-width: 900px; }
      `}</style>

      <section className="cf-hero">
        <div className="cf-container">
          <h1 className="cf-title"><CmsText section="college-fest" slot="hero.title" /></h1>
          <p className="cf-subtitle"><CmsText section="college-fest" slot="hero.subtitle" /></p>
        </div>
      </section>

      <section style={{ padding: "64px 0" }}>
        <div className="cf-container">
          <p className="cf-intro"><CmsText section="college-fest" slot="intro" multiline /></p>
        </div>
      </section>

      {/* The fest itself, from Admin -> Events. Its own heading is suppressed
          here because the page already carries one. */}
      <CollegeFest heading={null} />

      {/* Posters, schedules, rule books and registration forms - uploaded to
          "Campus Life -> College Fest" in Documents. */}
      <PageResources section="college-fest" />
    </main>
  );
}
