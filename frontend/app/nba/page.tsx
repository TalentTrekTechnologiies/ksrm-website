"use client";

import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";
import {
  getDepartmentProgrammesPublic,
  DepartmentProgramme,
} from "@/lib/department-programmes-api";
import { useLiveData } from "@/lib/use-live-data";

/**
 * NBA - programme accreditation.
 *
 * A page of its own, beside IQAC rather than inside it: NBA accredits
 * individual programmes and NAAC accredits the institution, so a reviewer
 * arriving for one has no reason to look under the other. Both are cited by
 * URL in submissions, which is why this is a real route and not an anchor on
 * another page.
 *
 * The accredited programmes are read from the same programme rows that drive
 * Courses & Intake - a programme's own `accreditation` field - so the list
 * cannot drift from what the college publishes everywhere else, and adding an
 * accreditation there puts the branch on this page without a deploy.
 */
export default function NbaPage() {
  const programmes = useLiveData<DepartmentProgramme[]>(
    () => getDepartmentProgrammesPublic().catch(() => [] as DepartmentProgramme[]),
    [],
  );

  const accredited = (programmes ?? [])
    .filter((p) => p.isActive !== false && /nba/i.test(p.accreditation ?? ""))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .nba-hero {
          position: relative; background-image: url('/banners/courses-intake.webp');
          background-size: cover; background-position: center; background-color: #2B3490;
          min-height: 320px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden;
        }
        .nba-hero::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(180deg, rgba(20,26,74,0.55) 0%, rgba(20,26,74,0.85) 100%);
        }
        .nba-hero > * { position: relative; z-index: 2; }

        .nba-badge-row { display: flex; align-items: center; gap: 22px; flex-wrap: wrap; justify-content: center; }
        .nba-logo { width: 96px; height: 96px; object-fit: contain; }

        .nba-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 28px; }
        .nba-card {
          background: #fff; border: 1px solid #eef0f3; border-left: 4px solid #2B3490;
          border-radius: 10px; padding: 18px 20px;
        }
        .nba-card h3 {
          font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700;
          color: #1a1a2e; margin: 0 0 6px;
        }
        .nba-card p { color: #666; font-size: 13.5px; margin: 0; }
        .nba-tag {
          display: inline-block; margin-top: 10px; background: #eef1f8; color: #2B3490;
          border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 700;
        }
        .nba-empty {
          border: 1px dashed #e2e0d8; background: #f9f9f7; border-radius: 10px;
          padding: 22px; color: #999; font-size: 14px; text-align: center; margin-top: 28px;
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="nba-hero">
          <div className="responsive-container">
            <div style={{ padding: "72px 0 0" }}>
              <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>
                <CmsText section="nba" slot="nba" />
              </h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 760 }}>
                <CmsText section="nba" slot="national-board-of-accreditation" />
              </p>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <div className="nba-badge-row">
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
              <img src="/nba.png" alt="NBA" className="nba-logo" loading="lazy" decoding="async"
                   onError={(e) => { e.currentTarget.style.display = "none" }} />
              <p style={{ color: "#555", fontSize: 15.5, lineHeight: 1.8, margin: 0, maxWidth: 820 }}>
                <CmsText section="nba" slot="k-s-r-m-college" multiline />
              </p>
            </div>
          </div>
        </section>

        <section style={{ padding: "64px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: 0, textAlign: "center" }}>
              <CmsText section="nba" slot="accredited-programmes" />
            </h2>

            {accredited.length === 0 ? (
              <p className="nba-empty">
                Accredited programmes appear here once an accreditation is recorded
                against them in Admin &rarr; Academics &rarr; Programmes.
              </p>
            ) : (
              <div className="nba-grid">
                {accredited.map((p) => (
                  <div className="nba-card" key={p.id}>
                    <h3>{p.name}</h3>
                    {p.department?.name && <p>{p.department.name}</p>}
                    <span className="nba-tag">{p.accreditation}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <PageResources section="nba" />
      </main>
    </>
  );
}
