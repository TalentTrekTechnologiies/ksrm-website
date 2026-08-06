"use client";

import { getDepartmentProgrammesPublic, DepartmentProgramme } from "@/lib/department-programmes-api";
import AdmissionsContact from "@/components/admissions/AdmissionsContact";
import { useLiveData } from "@/lib/use-live-data";
import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";

// Fallback shown until/unless diploma programmes are added in the CMS, so the
// page is never empty. Any diploma programme added to a department (Departments
// -> Programmes -> level "Diploma") replaces this list.
const courses = [
  { code: "CE", name: "Civil Engineering", desc: "Infrastructure and construction technology" },
  { code: "EEE", name: "Electrical and Electronics Engineering", desc: "Power systems and electrical technology" },
  { code: "ME", name: "Mechanical Engineering", desc: "Manufacturing and mechanical systems" },
  { code: "ECE", name: "Electronics and Communication Engineering", desc: "Electronics and communication systems" },
  { code: "CSE", name: "Computer Science and Engineering", desc: "Software development and computing" },
  { code: "AIML", name: "Artificial Intelligence and Machine Learning", desc: "AI and machine learning technologies" },
];

const features = [
  { title: "Industry-Oriented Training", desc: "Industry-oriented training programs with placement assistance and real-world experience" },
  { title: "24x7 Wi-Fi Connectivity", desc: "24x7 Wi-Fi facility with 1 Gbps bandwidth connectivity throughout campus" },
  { title: "Residential Facilities", desc: "Separate hostels for Girls & Boys with Wi-Fi and hot water facilities" },
  { title: "Transportation", desc: "Bus facility available from multiple locations including Kadapa, Rayachoti & surrounding areas" },
  { title: "Internship Opportunities", desc: "Paid internship opportunities in industry, academic institutions, and research organizations" },
  { title: "Air-Conditioned Facility", desc: "Fully air-conditioned residential facility on campus" },
];

const accreditations = [
  "Approved by AICTE New Delhi",
  "Affiliated to JNTUA Ananthapuramu",
  "ISO 9001:2015 | 14001:2015 | 50001:2018 Certified",
  "NBA Accredited",
  "NAAC A+ Accreditation",
  "Institution's Innovation Council (IIC)",
];

const rankings = [
  { title: "Careers360 Rating", value: "AAA+" },
  { title: "SII Gold Band", value: "Premium Institution" },
  { title: "STEM Rankings 2025", value: "31st Rank India" },
  { title: "The Week Rankings 2025", value: "AIR-144" },
];

const busRoutes = ["Vempalli", "Yerraguntla", "Badvel", "Mydukur", "Proddutur", "Ontimitta", "Kadapa", "Rayachoti"];

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B3490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function DiplomaAdmissionsPage() {
  // Every diploma programme across all departments, polled so one added in the
  // CMS appears here without a refresh. The fetcher never rejects, so an API
  // failure falls back to the built-in list rather than emptying the page.
  const cmsDiplomas = useLiveData<DepartmentProgramme[]>(
    () => getDepartmentProgrammesPublic(undefined, "DIPLOMA").catch(() => [] as DepartmentProgramme[]),
    [],
  );
  // CMS wins once anything is entered; otherwise the built-in list stands in.
  const diplomaCards =
    cmsDiplomas && cmsDiplomas.length > 0
      ? cmsDiplomas.map((p) => ({
          code: p.department?.shortName || p.department?.name || "Diploma",
          name: p.name,
          desc: p.intake ? `Annual intake: ${p.intake} seats` : "",
        }))
      : courses;

  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .dip-hero {
          position: relative;
          background-image: url('/banners/ug-admissions.webp');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 320px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .dip-hero > * { position: relative; z-index: 2; }
        .dip-breadcrumb { font-size: 15px; color: rgba(255,255,255,0.7); }
        .dip-breadcrumb a { color: #D4A500; text-decoration: none; }
        .dip-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700;
          color: #fff;
          margin: 8px 0 0;
        }
        .dip-subtitle { font-size: 17px; color: rgba(255,255,255,0.85); margin-top: 12px; }

        .dip-section { padding: 72px 0; background: #ffffff; }
        .dip-section-alt { padding: 72px 0; background: #f4f3ef; }
        .dip-intro { font-size: 17px; color: #555; line-height: 1.8; margin-bottom: 48px; max-width: 820px; }
        .dip-heading { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; color: #2B3490; margin: 0 0 48px; }

        .dip-courses-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .dip-course-card { background: #f9f9f9; border: 0.8px solid #ddd; border-radius: 12px; padding: 24px; }
        .dip-course-code {
          background: rgba(255,230,25,0.2);
          color: #D4A500;
          font-size: 13px;
          font-weight: 700;
          border-radius: 4px;
          padding: 4px 10px;
          display: inline-block;
          margin-bottom: 12px;
        }
        .dip-course-name { font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #2B3490; margin: 0 0 8px; }
        .dip-course-desc { font-size: 15px; color: #666; margin: 0; }

        .dip-features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        .dip-feature-card { background: #fff; border: 1.6px solid #eef0f3; border-radius: 12px; padding: 32px; text-align: center; }
        .dip-feature-icon {
          width: 48px; height: 48px; background: rgba(255,230,25,0.1); border-radius: 8px;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
        }
        .dip-feature-title { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #2B3490; margin: 0 0 8px; }
        .dip-feature-desc { font-size: 15px; color: #555; margin: 0; line-height: 1.6; }

        .dip-accred-list { display: flex; flex-direction: column; gap: 14px; }
        .dip-accred-item { display: flex; align-items: center; gap: 10px; font-size: 16px; color: #555; }

        .dip-ranking-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 32px; }
        .dip-ranking-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 8px; padding: 24px; text-align: center;
        }
        .dip-ranking-title { font-size: 13px; color: #fff; opacity: 0.85; }
        .dip-ranking-value { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; color: #fff; margin-top: 8px; }

        .dip-bus-pills { display: flex; flex-wrap: wrap; gap: 10px; }
        .dip-bus-pill {
          background: #fff; border: 1px solid #eef0f3; border-radius: 20px;
          padding: 8px 16px; font-size: 15px; color: #555;
        }

        .dip-contact {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          padding: 48px; border-radius: 12px; text-align: center; color: #fff;
        }
        .dip-contact h2 { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; margin: 0 0 12px; }
        .dip-contact-item { font-size: 16px; color: #fff; margin: 4px 0; }

        @media (max-width: 1024px) {
          .dip-courses-grid, .dip-features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .dip-courses-grid, .dip-features-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="dip-hero">
          <div className="responsive-container">
            <div style={{ paddingTop: 40 }}>
              <h1 className="dip-title"><CmsText section="admissions.diploma" slot="diploma-programs" /></h1>
              <p className="dip-subtitle"><CmsText section="admissions.diploma" slot="join-polytechnic-build-your-career" /></p>
            </div>
          </div>
        </section>

        <section className="dip-section">
          <div className="responsive-container">
            <p className="dip-intro"><CmsText section="admissions.diploma" slot="k-s-r-m-offers" multiline /></p>
            <h2 className="dip-heading"><CmsText section="admissions.diploma" slot="available-programs" /></h2>
            <div className="dip-courses-grid">
              {diplomaCards.map((c, i) => (
                <div className="dip-course-card" key={`${c.code}-${c.name}-${i}`}>
                  <div className="dip-course-code">{c.code}</div>
                  <h3 className="dip-course-name">{c.name}</h3>
                  {c.desc && <p className="dip-course-desc">{c.desc}</p>}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: "#888", marginTop: 16 }}><CmsText section="admissions.diploma" slot="subject-to-approval-by-statutory" /></p>
          </div>
        </section>

        <section className="dip-section-alt">
          <div className="responsive-container">
            <h2 className="dip-heading"><CmsText section="admissions.diploma" slot="why-choose-our-diploma" /></h2>
            <div className="dip-features-grid">
              {features.map((f, _i) => (
                <div className="dip-feature-card" key={f.title}>
                  <div className="dip-feature-icon"><CheckIcon /></div>
                  <h3 className="dip-feature-title"><CmsText section="admissions.diploma" slot={`features.${_i}.title`} /></h3>
                  <p className="dip-feature-desc"><CmsText section="admissions.diploma" slot={`features.${_i}.desc`} /></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dip-section">
          <div className="responsive-container">
            <h2 className="dip-heading"><CmsText section="admissions.diploma" slot="accreditations-rankings" /></h2>
            <div className="dip-accred-list">
              {accreditations.map((a) => (
                <div className="dip-accred-item" key={a}><CheckIcon />{a}</div>
              ))}
            </div>
            <div className="dip-ranking-grid">
              {rankings.map((r, _i) => (
                <div className="dip-ranking-card" key={r.title}>
                  <div className="dip-ranking-title"><CmsText section="admissions.diploma" slot={`rankings.${_i}.title`} /></div>
                  <div className="dip-ranking-value">{r.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="dip-section-alt">
          <div className="responsive-container">
            <h2 className="dip-heading"><CmsText section="admissions.diploma" slot="bus-routes-available" /></h2>
            <p style={{ color: "#555", marginBottom: 16 }}><CmsText section="admissions.diploma" slot="transportation-available-from" /></p>
            <div className="dip-bus-pills">
              {busRoutes.map((r) => (
                <div className="dip-bus-pill" key={r}>{r}</div>
              ))}
            </div>
          </div>
        </section>

        <AdmissionsContact />
      
      <PageResources section="admissions.diploma" />
      </main>
    </>
  );
}
