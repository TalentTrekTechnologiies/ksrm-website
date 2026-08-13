import type { Metadata } from "next";
import PlacedCommittees from "@/components/committees/PlacedCommittees";
import Link from "next/link";
import CmsText from "@/components/CmsText";
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "Campus Life",
  description: "Campus life at K.S.R.M. College of Engineering, Kadapa - library, hostels, sports, transport, cultural activities, NSS, startup cell and student support cells.",
  path: "/campus-life",
});

/**
 * Campus Life index. This route was a three-line "Coming Soon" stub even though
 * all eleven of its child pages exist and are linked from the navbar, so the
 * section's landing page looked unfinished. It now lists those children.
 */
/**
 * `slot` is the card's permanent id in Page Content, not its position here.
 * Removing or reordering a card must not hand its wording to its neighbour.
 * A new card takes the next unused number - 12 below, never a reused one.
 */
const SECTIONS = [
  { slot: 0, label: "Campus Facilities", href: "/campus-life/campus-facilities", blurb: "Classrooms, laboratories, auditorium and amenities across the campus." },
  { slot: 1, label: "Central Library", href: "/campus-life/library", blurb: "Books, journals, digital resources and reading halls." },
  { slot: 2, label: "Hostels", href: "/campus-life/hostels", blurb: "Separate hostel accommodation for boys and girls." },
  { slot: 3, label: "Transport", href: "/campus-life/transport", blurb: "Bus routes and parking across Kadapa and nearby towns." },
  // Slot 13, not 4.5 - ids are permanent, so a card inserted in the middle
  // takes the next unused number and only its POSITION here changes.
  { slot: 13, label: "Health Facilities", href: "/campus-life/health-facilities", blurb: "Campus health centre, first aid, ambulance and tie-ups with nearby hospitals." },
  { slot: 4, label: "Sports", href: "/campus-life/sports", blurb: "Grounds, indoor courts, gymnasium and tournaments." },
  { slot: 5, label: "Cultural", href: "/campus-life/cultural", blurb: "Cultural club, fests and student performances." },
  // Slot 6 (Professional Chapters) retired, not reused - chapters moved to
  // Departments, one "Student Chapter" section per department page, rather
  // than a single generic card here linking to five hardcoded club names.
  { slot: 7, label: "NSS", href: "/campus-life/nss", blurb: "National Service Scheme activities and community outreach." },
  // Points at the full /edc page, not the thin /campus-life/edc CMS shell
  // (now noindexed as a duplicate). Slot id stays 8 - it is the card's
  // permanent CMS identity, not its position.
  { slot: 8, label: "EDC", href: "/edc", blurb: "Entrepreneurship Development Cell programmes." },
  { slot: 9, label: "Startup Cell", href: "/campus-life/startup-cell", blurb: "Incubation support for student and faculty startups." },
  { slot: 10, label: "Anti-Ragging", href: "/campus-life/anti-ragging", blurb: "Anti-ragging committee, affidavits and helpline." },
  { slot: 11, label: "Grievance Redressal", href: "/campus-life/grievance", blurb: "Raise and track student grievances." },
  { slot: 12, label: "College Fest", href: "/campus-life/college-fest", blurb: "KONNECT and the KSNR Trophy - the annual techno-cultural fest and sports championship." },
];

export default function CampusLifeIndexPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .cl-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .cl-container { padding: 0 20px; } }
        .cl-hero { position: relative; background-image: url('/banners/campus-facilities.webp'); background-size: cover; background-position: center; background-color: #2B3490; padding: 92px 0; overflow: hidden; }
        .cl-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20,26,74,0.72) 0%, rgba(20,26,74,0.86) 100%); }
        .cl-hero > * { position: relative; z-index: 2; }
        .cl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .cl-card { display: block; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; text-decoration: none; background: #fff; transition: box-shadow .2s, transform .2s; }
        .cl-card:hover { box-shadow: 0 10px 28px rgba(0,0,0,.08); transform: translateY(-2px); }
      `}</style>

      <section className="cl-hero">
        <div className="cl-container">
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2rem, 4.5vw, 3.4rem)", fontWeight: 700, color: "#fff", margin: 0 }}><CmsText section="campus-life" slot="campus-life" /></h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, margin: "14px 0 0", maxWidth: 720 }}><CmsText section="campus-life" slot="facilities-activities-and-student-support" /></p>
        </div>
      </section>

      <section style={{ padding: "64px 0" }}>
        <div className="cl-container">
          <div className="cl-grid">
            {SECTIONS.map((s) => (
              <Link key={s.href} href={s.href} className="cl-card">
                <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}><CmsText section="campus-life" slot={`SECTIONS.${s.slot}.label`} /></h2>
                <p style={{ color: "#666", fontSize: 15, lineHeight: 1.6, margin: 0 }}><CmsText section="campus-life" slot={`SECTIONS.${s.slot}.blurb`} /></p>
                <span style={{ color: "#2B3490", fontSize: 14, fontWeight: 700, display: "inline-block", marginTop: 14 }}>Open →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* Any committee the CMS points at this page - see PlacedCommittees.
          Renders nothing until one is pointed here. */}
      <PlacedCommittees placement="CAMPUS_LIFE" heading="Committees" />

    </main>
  );
}
