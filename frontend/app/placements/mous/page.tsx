import type { Metadata } from "next"
import { pageMetadata } from "@/lib/seo"

export const metadata: Metadata = pageMetadata({
  title: "MoUs & Industry Collaborations",
  description: "Memoranda of Understanding and industry collaborations at K.S.R.M. College of Engineering, Kadapa - technology and industry partners.",
  path: "/placements/mous",
})

import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";

﻿import PlacementsSubnav from "@/components/PlacementsSubnav";

const partnerTable = [
  { name: "ServiceNow", training: true, cert: "CSA/CAD", internships: true, hackathons: "HackNow", placements: true },
  { name: "Cisco", training: true, cert: "NetAcad", internships: true, hackathons: true, placements: true },
  { name: "Oracle", training: true, cert: "Oracle Academy", internships: true, hackathons: true, placements: true },
  { name: "AWS", training: true, cert: "AWS Academy", internships: true, hackathons: false, placements: true },
  { name: "Salesforce", training: true, cert: "Superbadges", internships: true, hackathons: true, placements: true },
  { name: "IBM", training: true, cert: "AIML Programs", internships: true, hackathons: true, placements: true },
  { name: "Infosys Springboard", training: true, cert: "Courses", internships: true, hackathons: true, placements: true },
  { name: "Snowflake", training: true, cert: "SnowPro Core", internships: true, hackathons: true, placements: true },
];

const impactList = [
  "Earn globally recognized certifications.",
  "Participate in industry-sponsored training programs.",
  "Gain hands-on experience through internships and projects.",
  "Develop expertise in emerging technologies.",
  "Improve placement readiness and employability.",
  "Access career opportunities with leading organizations.",
];

export default function MoUsPage() {
  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }

        .mous-hero {
          position: relative;
          background-image: url('/banners/mous.webp');
          background-size: cover;
          background-position: center;
          background-color: #f5f5f5;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .mous-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%);
          z-index: 1;
        }
        .mous-hero > * { position: relative; z-index: 2; }
        .mous-breadcrumb { font-size: 15px; color: rgba(255,255,255,0.7); }
        .mous-breadcrumb a { color: #D4A500; text-decoration: none; }
        .mous-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          font-weight: 700;
          color: #fff;
          margin: 8px 0 0;
          line-height: 1.1;
          text-align: left;
        }
        .mous-subtitle {
          color: rgba(255,255,255,0.9);
          font-size: 17px;
          margin-top: 12px;
          max-width: 600px;
        }

        .mous-intro-section { padding: 72px 0; background: #ffffff; }
        .mous-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 24px; }
        .mous-text { font-size: 17px; line-height: 1.8; color: #555; text-align: justify; margin: 16px 0; }
        .mous-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }
        .mous-table-section { padding: 72px 0; background: #ffffff; }
        .mous-table { width: 100%; border-collapse: collapse; margin-top: 32px; background: #fff; border-radius: 8px; }
        .mous-table-wrapper { overflow-x: auto; }
        .mous-table th { background: #2B3490; color: #fff; padding: 16px 14px; text-align: left; font-weight: 700; font-size: 14px; text-transform: uppercase; }
        .mous-table td { padding: 14px; border-bottom: 1px solid #eef0f3; color: #555; font-size: 15px; }
        .mous-table tr:nth-child(even) { background: #f7f8fa; }
        .mous-checkmark { color: #2B3490; font-weight: 700; }
        .mous-list { list-style: none; padding: 0; margin: 32px 0; }
        .mous-list li { padding: 12px 0 12px 28px; position: relative; font-size: 16px; color: #555; line-height: 1.6; }
        .mous-list li::before { content: '✓'; position: absolute; left: 0; color: #D4A500; font-weight: 700; }
        .mous-impact-section { padding: 72px 0; background: #f4f3ef; }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="mous-hero">
          <div className="responsive-container">
            <div style={{ paddingTop: 40 }}>
              <h1 className="mous-title"><CmsText section="placements.mous" slot="mous" /></h1>
              <p className="mous-subtitle"><CmsText section="placements.mous" slot="placements-career-development" /></p>
            </div>
          </div>
        </section>
        <PlacementsSubnav active="/placements/mous" />

        <section className="mous-intro-section">
          <div className="responsive-container">
            <h2 className="mous-heading"><CmsText section="placements.mous" slot="industry-collaborations-memoranda-of-understandi" /></h2>
            <p className="mous-text"><CmsText section="placements.mous" slot="k-s-r-m-college" multiline /></p>
          </div>
        </section>

        <section className="mous-table-section">
          <div className="responsive-container">
            <h2 className="mous-section-heading"><CmsText section="placements.mous" slot="major-industry-technology-partners" /></h2>
            <p className="mous-text"><CmsText section="placements.mous" slot="ksrmce-actively-collaborates-with-leading" multiline /></p>
            <div className="mous-table-wrapper">
              <table className="mous-table">
                <thead>
                  <tr><th>Partner</th><th>Training</th><th>Certifications</th><th>Internships</th><th>Hackathons</th><th>Placements</th></tr>
                </thead>
                <tbody>
                  {partnerTable.map((p, _i) => (
                    <tr key={p.name}>
                      <td><strong><CmsText section="placements.mous" slot={`partnerTable.${_i}.name`} /></strong></td>
                      <td className="mous-checkmark">{p.training ? "✓" : "-"}</td>
                      <td><CmsText section="placements.mous" slot={`partnerTable.${_i}.cert`} /></td>
                      <td className="mous-checkmark">{p.internships ? "✓" : "-"}</td>
                      <td>{typeof p.hackathons === "string" ? p.hackathons : p.hackathons ? "✓" : "-"}</td>
                      <td className="mous-checkmark">{p.placements ? "✓" : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mous-impact-section">
          <div className="responsive-container">
            <h2 className="mous-section-heading"><CmsText section="placements.mous" slot="impact-of-our-mous" /></h2>
            <p className="mous-text"><CmsText section="placements.mous" slot="the-institution-s-industry-partnerships" /></p>
            <ul className="mous-list">
              {impactList.map((i) => <li key={i}>{i}</li>)}
            </ul>
            <p className="mous-text" style={{ fontStyle: "italic", fontWeight: 500, marginTop: 32 }}><CmsText section="placements.mous" slot="at-ksrmce-industry-collaborations-are" multiline /></p>
          </div>
        </section>
      
      <PageResources section="placements.mous" />
      </main>
    </>
  );
}
