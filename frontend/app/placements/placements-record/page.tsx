"use client";

import PlacementsSubnav from "@/components/PlacementsSubnav";
import { getPlacementsPublic, Placement } from "@/lib/placements-api";
import { useLiveData } from "@/lib/use-live-data";
import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";

export default function PlacementsRecordPage() {
  // Polled, so a placement record published in the admin appears here without a
  // refresh. The fetcher never rejects, so a failed request resolves to [] and
  // still marks the page loaded - the empty state below covers it, as before.
  const data = useLiveData<Placement[]>(
    () => getPlacementsPublic().catch(() => [] as Placement[]),
    [],
  );
  const records = data ?? [];
  const loaded = data !== null;

  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }

        .record-hero {
          position: relative;
          background-image: url('/banners/placement-records.png');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .record-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
          z-index: 1;
        }
        .record-hero > * { position: relative; z-index: 2; }
        .record-breadcrumb { font-size: 15px; color: rgba(255,255,255,0.7); }
        .record-breadcrumb a { color: #D4A500; text-decoration: none; }
        .record-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          margin: 8px 0 0;
          line-height: 1.1;
          text-align: left;
        }
        .record-subtitle {
          color: rgba(255,255,255,0.9);
          font-size: 17px;
          margin-top: 12px;
          max-width: 600px;
        }

        .section { padding: 100px 0; background: #ffffff; }
        .heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; text-align: center; }
        .coming-soon-box { background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); color: #ffffff; padding: 60px 40px; border-radius: 12px; text-align: center; }
        .coming-soon-text { font-size: 19px; line-height: 1.8; margin: 0; }
        .coming-soon-icon { font-size: clamp(29px, 7.7vw, 48px); margin-bottom: 16px; }
        .record-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; margin-top: 40px; }
        .record-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; text-align: center; }
        .record-photo { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px; background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); display: flex; align-items: center; justify-content: center; overflow: hidden; color: #fff; font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; }
        .record-photo img { width: 100%; height: 100%; object-fit: cover; }
        .record-name { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
        .record-company { color: #2B3490; font-weight: 600; font-size: 15px; margin: 0 0 4px; }
        .record-meta { font-size: 14px; color: #666; margin: 0; }
        .record-package { display: inline-block; background: #eef1ff; color: #2B3490; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 700; margin-top: 10px; }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="record-hero">
          <div className="responsive-container">
            <div style={{ paddingTop: 40 }}>
              <h1 className="record-title"><CmsText section="placements.record" slot="placements-record" /></h1>
              <p className="record-subtitle"><CmsText section="placements.record" slot="placements-career-development" /></p>
            </div>
          </div>
        </section>
        <PlacementsSubnav active="/placements/placements-record" />
        <section className="section">
          <div className="responsive-container">
            {records.length === 0 ? (
              <div className="coming-soon-box">
                <div className="coming-soon-icon">📊</div>
                <h2 className="heading" style={{ color: "#D4A500", marginBottom: 16 }}><CmsText section="placements.record" slot="placements-record-2" /></h2>
                <p className="coming-soon-text">
                  {loaded
                    ? "Our placement statistics and records are coming soon. Check back for detailed information about our placement achievements!"
                    : "Loading placement records..."}
                </p>
              </div>
            ) : (
              <>
                <h2 className="heading"><CmsText section="placements.record" slot="our-placed-students" /></h2>
                <div className="record-grid">
                  {records.map((r) => (
                    <div className="record-card" key={r.id}>
                      <div className="record-photo">
                        {r.imageUrl ? (
                          <img src={r.imageUrl} alt={r.studentName} onError={(e) => { e.currentTarget.style.display = "none" }} />
                        ) : (
                          r.studentName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
                        )}
                      </div>
                      <h3 className="record-name">{r.studentName}</h3>
                      <p className="record-company">{r.company}</p>
                      <p className="record-meta">{r.department} · {r.year}</p>
                      <span className="record-package">{r.package}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      
      <PageResources section="placements.record" />
      </main>
    </>
  );
}
