"use client";

import PlacementsSubnav from "@/components/PlacementsSubnav";
import { getRecruitersPublic, Recruiter } from "@/lib/homepage-api";
import { useLiveData } from "@/lib/use-live-data";
import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";

export default function OurRecruitersPage() {
  // Polled, so a recruiter published in the admin appears here without a
  // refresh. The fetcher never rejects, so a failed request resolves to [] and
  // still marks the page loaded - the empty state below covers it, as before.
  const data = useLiveData<Recruiter[]>(
    () => getRecruitersPublic().then(({ items }) => items).catch(() => [] as Recruiter[]),
    [],
  );
  const recruiters = data ?? [];
  const loaded = data !== null;

  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }

        .recruiters-hero {
          position: relative;
          background-image: url('/banners/recruiters.png');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .recruiters-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
          z-index: 1;
        }
        .recruiters-hero > * { position: relative; z-index: 2; }
        .recruiters-breadcrumb { font-size: 15px; color: rgba(255,255,255,0.7); }
        .recruiters-breadcrumb a { color: #D4A500; text-decoration: none; }
        .recruiters-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          margin: 8px 0 0;
          line-height: 1.1;
          text-align: left;
        }
        .recruiters-subtitle {
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
        .recruiters-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 20px; margin-top: 40px; }
        .recruiter-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 20px; display: flex; align-items: center; justify-content: center; height: 110px; }
        .recruiter-card img { max-width: 100%; max-height: 100%; object-fit: contain; }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="recruiters-hero">
          <div className="responsive-container">
            <div style={{ paddingTop: 40 }}>
              <h1 className="recruiters-title"><CmsText section="placements.recruiters" slot="our-recruiters" /></h1>
              <p className="recruiters-subtitle"><CmsText section="placements.recruiters" slot="placements-career-development" /></p>
            </div>
          </div>
        </section>
        <PlacementsSubnav active="/placements/our-recruiters" />
        <section className="section">
          <div className="responsive-container">
            {recruiters.length === 0 ? (
              <div className="coming-soon-box">
                <div className="coming-soon-icon">📋</div>
                <h2 className="heading" style={{ color: "#D4A500", marginBottom: 16 }}><CmsText section="placements.recruiters" slot="our-recruiters-2" /></h2>
                <p className="coming-soon-text">
                  {loaded
                    ? "Information about our industry partners and recruiters is coming soon. Check back for updates!"
                    : "Loading recruiters..."}
                </p>
              </div>
            ) : (
              <>
                <h2 className="heading"><CmsText section="placements.recruiters" slot="recruited-by-top-companies" /></h2>
                <div className="recruiters-grid">
                  {recruiters.map((r) => (
                    <div className="recruiter-card" key={r.id}>
                      <img
                        src={r.logoUrl}
                        alt={r.name}
                        title={r.name}
                        onError={(e) => { e.currentTarget.style.display = "none" }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      
      <PageResources section="placements.recruiters" />
      </main>
    </>
  );
}
