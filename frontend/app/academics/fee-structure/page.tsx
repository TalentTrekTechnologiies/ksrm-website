"use client";

import PageResources from "@/components/PageResources";
import { getPageTablesPublic, PageTable } from "@/lib/page-tables-api";
import { useLiveData } from "@/lib/use-live-data";
import CmsText from "@/components/CmsText";

const btechFirstYear = [
  { branch: "Computer Science & Engineering", fee: "₹1,15,000", admission: "₹5,000", notes: "Per annum for 4 years" },
  { branch: "Electronics & Communication Engineering", fee: "₹1,15,000", admission: "₹5,000", notes: "—" },
  { branch: "Electrical & Electronics Engineering", fee: "₹1,10,000", admission: "₹5,000", notes: "—" },
  { branch: "Civil Engineering", fee: "₹1,10,000", admission: "₹5,000", notes: "—" },
  { branch: "Mechanical Engineering", fee: "₹1,10,000", admission: "₹5,000", notes: "—" },
];

const btechSpecializations = [
  { branch: "CSE - Data Science", fee: "₹1,25,000", admission: "₹5,000", notes: "Specialization available from 2nd year" },
  { branch: "CSE - Artificial Intelligence & Machine Learning", fee: "₹1,25,000", admission: "₹5,000", notes: "—" },
];

const mtech = [
  { branch: "Computer Science & Engineering", fee: "₹80,000", admission: "₹5,000", notes: "Per annum for 2 years" },
  { branch: "Embedded Systems & VLSI", fee: "₹80,000", admission: "₹5,000", notes: "—" },
  { branch: "Power Systems", fee: "₹75,000", admission: "₹5,000", notes: "—" },
  { branch: "Geotechnical Engineering", fee: "₹75,000", admission: "₹5,000", notes: "—" },
  { branch: "CAD/CAM", fee: "₹75,000", admission: "₹5,000", notes: "—" },
];

const mba = [
  { branch: "Master of Business Administration", fee: "₹2,50,000", admission: "₹10,000", notes: "Per annum for 2 years. Includes placement assistance." },
];

const scholarships = [
  { title: "Merit-based Scholarships", desc: "Scholarships up to 50% of annual fee for students with exceptional academic performance in entrance exams and board examinations." },
  { title: "Management Quota Scholarships", desc: "Reduced fee structure and partial scholarships available for management quota students as per college policies." },
  { title: "SC/ST/OBC Scholarships", desc: "As per government directives, eligible students from SC/ST/OBC categories receive fee concessions and scholarships." },
  { title: "Sports Scholarships", desc: "Merit-based fee concessions for students selected to college sports teams and tournaments." },
  { title: "NRI/Foreign Student Scholarships", desc: "Special fee structure and scholarship opportunities available for foreign students and NRI applicants." },
  { title: "Economically Weaker Section (EWS)", desc: "Fee concessions up to 100% for students from economically weaker sections as per government norms." },
  { title: "Government Scholarships", desc: "Students are encouraged to apply for state and central government scholarships for which they are eligible." },
  { title: "Parent-Teacher Association Assistance", desc: "The college PTA provides additional financial assistance to deserving students on need basis." },
];

function AlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2B3490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
function AwardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2B3490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" />
    </svg>
  );
}

/** Renders a CMS-managed table. Columns and rows are free-form, so a fee
 *  revision is an admin edit rather than a code change. */
function CmsTable({ table, first }: { table: PageTable; first?: boolean }) {
  return (
    <div>
      <h3 className="fee-programme-title" style={first ? { marginTop: 0 } : undefined}>{table.title}</h3>
      <div className="fee-table-wrapper">
        <table className="fee-table">
          <thead>
            <tr>{table.columns.map((c, i) => <th key={i}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} style={ci === 0 ? { fontWeight: 600 } : ci === row.length - 1 ? { fontSize: 13, color: "#666" } : undefined}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.footnote && <p style={{ fontSize: 13, color: "#666", marginTop: 8 }}>{table.footnote}</p>}
      </div>
    </div>
  );
}

function FeeTable({
  title,
  rows,
  first,
}: {
  title: string;
  rows: { branch: string; fee: string; admission: string; notes: string }[];
  first?: boolean;
}) {
  return (
    <div>
      <h3 className="fee-programme-title" style={first ? { marginTop: 0 } : undefined}>{title}</h3>
      <div className="fee-table-wrapper">
        <table className="fee-table">
          <thead>
            <tr><th>Branch / Specialization</th><th>Annual Fee</th><th>Admission Fee</th><th>Notes</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.branch}>
                <td style={{ fontWeight: 600 }}>{r.branch}</td>
                <td>{r.fee}</td>
                <td>{r.admission}</td>
                <td style={{ fontSize: 13, color: "#666" }}>{r.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function FeeStructurePage() {
  // Fee tables come from the CMS so a yearly revision needs no code change;
  // the hardcoded tables below remain as a fallback if none are configured.
  const cmsTables = useLiveData<PageTable[]>(
    () => getPageTablesPublic("academics.fee-structure").catch(() => [] as PageTable[]),
    [],
  );

  return (
    <>
      <style>{`
        .responsive-container { width: 100%; max-width: 1760px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .fee-hero {
          position: relative;
          background-image: url('/banners/fee-structure.png');
          background-size: cover;
          background-position: center;
          background-color: #2B3490;
          min-height: 320px;
          display: flex;
          align-items: flex-end;
          overflow: hidden;
          padding-bottom: 40px;
        }
        .fee-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
        }
        .fee-hero > * { position: relative; z-index: 2; }
        .fee-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #D4A500;
        }
        .fee-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-top: 24px; }
        .fee-breadcrumb a { color: #D4A500; text-decoration: none; }
        .fee-breadcrumb span { color: #D4A500; }

        .fee-notice {
          background: #D4A500;
          border-left: 4px solid #2B3490;
          padding: 20px 24px;
          border-radius: 8px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
        }
        .fee-notice-icon { flex-shrink: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
        .fee-notice-content p { color: #2B3490; font-size: 16px; line-height: 1.6; margin: 0; font-weight: 500; }

        .fee-table-wrapper { overflow-x: auto; margin-top: 24px; }
        .fee-table { width: 100%; border-collapse: collapse; font-size: 16px; }
        .fee-table thead th {
          background: #2B3490; color: #fff; padding: 16px; text-align: left;
          font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 15px;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .fee-table tbody td { padding: 14px 16px; border-bottom: 1px solid #eef0f3; }
        .fee-table tbody tr:nth-child(odd) { background: #f4f3ef; }
        .fee-table tbody tr:nth-child(even) { background: #ffffff; }
        .fee-table tbody tr:hover { background: #fffaed; }
        .fee-table tbody tr:hover td { color: #2B3490; font-weight: 600; }

        .fee-programme-title { font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #1a1a2e; margin: 40px 0 20px; }

        .fee-scholarship-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 24px; }
        .fee-scholarship-card {
          background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 28px;
          display: flex; flex-direction: column; gap: 12px; transition: all 0.2s;
        }
        .fee-scholarship-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(43,52,144,0.12); border-color: #D4A500; }
        .fee-scholarship-icon { width: 44px; height: 44px; background: #eef1ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .fee-scholarship-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0; }
        .fee-scholarship-card p { color: #555; font-size: 15px; line-height: 1.6; margin: 0; }

        .fee-contact-card {
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          border-radius: 12px; padding: 40px; color: #fff; text-align: center;
        }
        .fee-contact-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; margin: 0 0 24px; }
        .fee-contact-items { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; margin-bottom: 24px; }
        .fee-contact-item { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .fee-contact-item-icon { width: 48px; height: 48px; background: rgba(255,230,25,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .fee-contact-item h4 { font-family: 'Rajdhani', sans-serif; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #D4A500; margin: 0; font-weight: 700; }
        .fee-contact-item p { font-size: 16px; margin: 0; line-height: 1.6; }
        .fee-contact-item a { color: #D4A500; text-decoration: none; }
        .fee-contact-item a:hover { opacity: 0.8; }
        .fee-contact-note { font-size: 15px; line-height: 1.6; padding-top: 24px; border-top: 1px solid rgba(255,230,25,0.3); }

        @media (max-width: 900px) { .fee-contact-items { grid-template-columns: 1fr; gap: 24px; } }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="fee-hero">
          <div className="responsive-container">
            <div style={{ padding: "72px 0" }}>
              <div className="fee-eyebrow" style={{ marginBottom: 16 }}>Academics</div>
              <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}><CmsText section="academics.fee-structure" slot="fee-structure" /></h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 700 }}><CmsText section="academics.fee-structure" slot="transparent-and-affordable-education" /></p>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <div className="fee-notice">
              <div className="fee-notice-icon"><AlertIcon /></div>
              <div className="fee-notice-content">
                <p><CmsText section="academics.fee-structure" slot="fees-are-subject-to-revision" multiline /></p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0, maxWidth: 820 }}><CmsText section="academics.fee-structure" slot="k-s-r-m-college" multiline /></p>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}><CmsText section="academics.fee-structure" slot="fee-structure-by-programme" /></h2>
            {cmsTables && cmsTables.length > 0 ? (
              cmsTables.map((t, i) => <CmsTable key={t.id} table={t} first={i === 0} />)
            ) : (
              <>
                <FeeTable title="B.Tech (First Year)" rows={btechFirstYear} first />
                <FeeTable title="B.Tech (Specializations)" rows={btechSpecializations} />
                <FeeTable title="M.Tech (2-Year)" rows={mtech} />
                <FeeTable title="MBA (2-Year)" rows={mba} />
              </>
            )}
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}><CmsText section="academics.fee-structure" slot="scholarships-financial-assistance" /></h2>
            <div className="fee-scholarship-grid">
              {scholarships.map((s, _i) => (
                <div className="fee-scholarship-card" key={s.title}>
                  <div className="fee-scholarship-icon"><AwardIcon /></div>
                  <h3><CmsText section="academics.fee-structure" slot={`scholarships.${_i}.title`} /></h3>
                  <p><CmsText section="academics.fee-structure" slot={`scholarships.${_i}.desc`} /></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <div className="fee-contact-card">
              <h3><CmsText section="academics.fee-structure" slot="accounts-fee-management-office" /></h3>
              <div className="fee-contact-items">
                <div className="fee-contact-item">
                  <div className="fee-contact-item-icon"><PhoneIcon /></div>
                  <h4><CmsText section="academics.fee-structure" slot="phone" /></h4>
                  <p><a href="tel:+918554233333">+91-8554-233333</a></p>
                </div>
                <div className="fee-contact-item">
                  <div className="fee-contact-item-icon"><MailIcon /></div>
                  <h4><CmsText section="academics.fee-structure" slot="email" /></h4>
                  <p><a href="mailto:fee@ksrmce.ac.in">fee@ksrmce.ac.in</a></p>
                </div>
              </div>
              <div className="fee-contact-note">
                For fee payment options, scholarships inquiries and fee-related queries, contact the Accounts
                Office during office hours (9:00 AM - 5:00 PM, Monday to Friday).
              </div>
            </div>
          </div>
        </section>
      
      <PageResources section="academics.fee-structure" />
      </main>
    </>
  );
}
