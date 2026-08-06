import type { Metadata } from "next";
import CmsText from "@/components/CmsText";
import PageResources from "@/components/PageResources";
import PlacedCommittees from "@/components/committees/PlacedCommittees";

export const metadata: Metadata = {
  title: "Health Facilities | K.S.R.M. College of Engineering",
  description:
    "Health facilities at K.S.R.M. College of Engineering, Kadapa - campus health centre, first aid, ambulance and hospital tie-ups for students and staff.",
  alternates: { canonical: "/campus-life/health-facilities" },
};

/**
 * Health facilities, under Campus Life.
 *
 * Every fact on this page is a Page Content field rather than prose baked into
 * the file: a doctor's visiting hours, an ambulance number and the hospital a
 * college has an arrangement with are exactly the things that change without
 * anyone thinking to ask for a deployment - and a wrong ambulance number on a
 * health page is worse than no page.
 *
 * The built-in wording below describes provision the college has confirmed it
 * makes; the specifics an admin must fill in are written as prompts rather
 * than invented, so nothing here can read as fact until somebody has checked
 * it.
 */
const FACILITIES = [
  {
    slot: 0,
    icon: "🏥",
    title: "Campus Health Centre",
    desc: "A health centre on campus for students and staff, staffed during college hours for consultation and basic treatment.",
  },
  {
    slot: 1,
    icon: "🩹",
    title: "First Aid",
    desc: "First-aid points in the academic blocks, hostels and the sports ground, checked and restocked regularly.",
  },
  {
    slot: 2,
    icon: "🚑",
    title: "Ambulance",
    desc: "An ambulance is available for emergencies and for transfer to hospital in Kadapa.",
  },
  {
    slot: 3,
    icon: "🤝",
    title: "Hospital Tie-ups",
    desc: "Arrangements with hospitals in Kadapa so a student needing more than the campus centre can provide is seen quickly.",
  },
  {
    slot: 4,
    icon: "🧠",
    title: "Student Counselling",
    desc: "Confidential counselling for students, alongside the mentoring every student has through their department.",
  },
  {
    slot: 5,
    icon: "💧",
    title: "Sanitation & Drinking Water",
    desc: "RO drinking water across the campus and hostels, with cleaning and water testing on a regular schedule.",
  },
];

export default function HealthFacilitiesPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .hf-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .hf-container { padding: 0 32px; } }
        @media (max-width: 768px)  { .hf-container { padding: 0 20px; } }
        @media (max-width: 480px)  { .hf-container { padding: 0 14px; } }

        .hf-hero {
          position: relative; background-image: url('/banners/campus-facilities.webp');
          background-size: cover; background-position: center; background-color: #2B3490;
          min-height: 320px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden;
        }
        .hf-hero::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%); z-index: 1;
        }
        .hf-hero > * { position: relative; z-index: 2; }
        .hf-title {
          font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700; color: #fff; margin: 0; line-height: 1.08;
          text-shadow: 0 2px 12px rgba(0,0,0,0.7);
        }
        .hf-subtitle {
          color: rgba(255,255,255,0.95); font-size: 19px; margin: 16px 0 0; max-width: 760px;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }
        .hf-intro { font-size: 17px; color: #555; line-height: 1.85; max-width: 900px; }
        .hf-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .hf-card { background: #fff; border: 1px solid #eef0f3; border-top: 4px solid #2B3490; border-radius: 10px; padding: 24px; }
        .hf-ico { font-size: 26px; line-height: 1; }
        .hf-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #2B3490; margin: 12px 0 8px; }
        .hf-card p { font-size: 15px; color: #555; line-height: 1.7; margin: 0; }

        .hf-emergency {
          background: #e74c3c; color: #fff; border-radius: 12px; padding: 32px;
          display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px;
        }
        .hf-emergency h2 {
          font-family: 'Rajdhani', sans-serif; font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 800; margin: 0 0 4px; grid-column: 1 / -1;
        }
        .hf-em-item dt { font-size: 11.5px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; opacity: .9; }
        .hf-em-item dd { margin: 4px 0 0; font-size: 18px; font-weight: 700; font-family: 'Rajdhani', sans-serif; }
        .hf-em-item a { color: #fff; text-decoration: none; }
        .hf-em-item a:hover { text-decoration: underline; }
      `}</style>

      <section className="hf-hero">
        <div className="hf-container">
          <h1 className="hf-title"><CmsText section="health-facilities" slot="hero.title" /></h1>
          <p className="hf-subtitle"><CmsText section="health-facilities" slot="hero.subtitle" /></p>
        </div>
      </section>

      <section style={{ padding: "64px 0" }}>
        <div className="hf-container">
          <p className="hf-intro"><CmsText section="health-facilities" slot="intro" multiline /></p>
        </div>
      </section>

      <section style={{ padding: "0 0 64px" }}>
        <div className="hf-container">
          <div className="hf-grid">
            {FACILITIES.map((f) => (
              <div className="hf-card" key={f.slot}>
                <div className="hf-ico" aria-hidden="true">{f.icon}</div>
                <h3><CmsText section="health-facilities" slot={`facilities.${f.slot}.title`} /></h3>
                <p><CmsText section="health-facilities" slot={`facilities.${f.slot}.desc`} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency contacts. Every value is a Page Content field and every one
          ships blank on purpose - a placeholder number on a health page is
          worse than an empty space, because somebody would dial it. */}
      <section style={{ padding: "0 0 72px" }}>
        <div className="hf-container">
          <dl className="hf-emergency">
            <h2><CmsText section="health-facilities" slot="emergency.heading" /></h2>
            <div className="hf-em-item">
              <dt>Campus health centre</dt>
              <dd><CmsText section="health-facilities" slot="emergency.centre" /></dd>
            </div>
            <div className="hf-em-item">
              <dt>Ambulance</dt>
              <dd><CmsText section="health-facilities" slot="emergency.ambulance" /></dd>
            </div>
            <div className="hf-em-item">
              <dt>Opening hours</dt>
              <dd><CmsText section="health-facilities" slot="emergency.hours" /></dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Any committee the CMS points at this page - a Health & Hygiene
          committee, for instance. Renders nothing until one is pointed here. */}
      <PlacedCommittees placement="CAMPUS_LIFE" heading="Committees" />

      <PageResources section="health-facilities" />
    </main>
  );
}
