"use client";

import { useState } from "react";

const regulations = [
  {
    code: "R20",
    year: "2020",
    applicable: "Students admitted from 2020 onwards",
    description: "The latest regulations incorporating outcome-based education, credit system, and industry-aligned curriculum. R20 regulations emphasize skill development, research aptitude, and holistic learning.",
    keyPoints: [
      "Credit-based semester system with minimum 120 credits for B.Tech",
      "Outcome-Based Education (OBE) framework aligned with NBA standards",
      "Continuous internal assessment with 30% weightage",
      "End-semester examinations with 70% weightage",
      "CGPA-based promotion and graduation criteria",
      "Provision for electives and specializations from 2nd year",
      "Mandatory internship and project work",
      "Minimum 6.5 CGPA required for distinction",
    ],
    pdf: "/documents/regulations/R20-regulations.pdf",
  },
  {
    code: "R19",
    year: "2019",
    applicable: "Students admitted from 2019 to 2019",
    description: "Previous regulation framework with traditional semester system. Provides flexibility in course selection and assessment methodology.",
    keyPoints: [
      "Credit-based semester system with minimum 120 credits for B.Tech",
      "Continuous evaluation (assignments, quizzes, mid-semester) carrying 30% marks",
      "End-semester examinations carrying 70% marks",
      "CGPA-based progression and graduation",
      "Provision for lateral entry and bridge programmes",
      "Electives from third year onwards",
      "Minimum GPA 6.0 for distinction",
      "Flexibility in course completion up to 8 years",
    ],
    pdf: "/documents/regulations/R19-regulations.pdf",
  },
  {
    code: "R16",
    year: "2016",
    applicable: "Students admitted from 2016 to 2018",
    description: "Former regulation framework with traditional grading system. Still applicable to continuing students as per JNTUA guidelines.",
    keyPoints: [
      "Semester system with 120 credits for B.Tech programmes",
      "Continuous assessment and end-semester examinations",
      "Grade-point system for assessment",
      "Provision for supplementary examinations",
      "Minimum 50% attendance required",
      "Electives from 3rd year onwards",
      "Comprehensive project and viva voce requirements",
      "Maximum academic period: 8 years from admission",
    ],
    pdf: "/documents/regulations/R16-regulations.pdf",
  },
  {
    code: "R13",
    year: "2013",
    applicable: "Old regulation (archived reference)",
    description: "Earlier regulation framework maintained for reference and archival purposes. New admissions follow R20 or R19.",
    keyPoints: [
      "Semester system with coursework and evaluation",
      "Continuous internal assessment (30%) and end-semester (70%)",
      "Grade-based promotion system",
      "Electives available from 4th semester onwards",
      "Project work in final year",
      "Provision for improvement examinations",
      "Academic performance monitoring and counseling",
    ],
    pdf: "/documents/regulations/R13-regulations.pdf",
  },
];

const examRules = [
  { title: "Minimum Attendance", text: "Students must maintain a minimum of 75% attendance in theory courses and 80% in practical/laboratory courses to be eligible for examinations. Condonation of shortage of attendance may be granted by the Principal in genuine cases." },
  { title: "Internal Assessment", text: "Internal assessment comprises assignments, quizzes, mid-semester examinations, and participation, carrying 30% weightage of total marks. The distribution is as per department guidelines." },
  { title: "End-Semester Examination", text: "End-semester examination is conducted by JNTUA and carries 70% weightage. The duration is typically 3 hours for theory courses and 3-4 hours for practical examinations." },
  { title: "Pass Criteria", text: "A student must obtain a minimum of 35% marks in end-semester examination and 40% in overall (internal + external) to pass a course. For practical courses, 50% marks overall is required." },
  { title: "Supplementary Examinations", text: "Students who fail a course can appear for supplementary examinations in the next available opportunity (usually within 6 months). A maximum of 2 supplementary attempts is permitted." },
  { title: "Improvement Examinations", text: "Students may appear for improvement examinations to enhance their grades in passed courses. The better of the two scores will be considered for CGPA calculation." },
  { title: "Malpractice and Misconduct", text: "Use of unfair means, copying, impersonation, or any form of academic dishonesty will result in cancellation of examination for that semester and disciplinary action as per college norms." },
  { title: "Leave During Examinations", text: "Leave during examinations is not granted except on medical grounds with supporting documents. Students absent due to medical reasons should submit medical certificates within 7 days." },
  { title: "Grade Point Scale", text: "Marks are converted to CGPA on a scale of 0-10. Each course has specific credit points. CGPA is calculated as the weighted average of grade points across all courses." },
  { title: "Academic Probation", text: "Students with CGPA below 5.0 at the end of a semester are placed on academic probation and must improve performance in the next semester or risk dismissal from the programme." },
];

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" />
    </svg>
  );
}
function ChevronDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function RuleItem({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`reg-rule-item ${open ? "expanded" : ""}`}>
      <button className="reg-rule-header" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <div className="reg-chevron"><ChevronDown /></div>
      </button>
      <div className="reg-rule-content"><p>{text}</p></div>
    </div>
  );
}

export default function RegulationsPage() {
  return (
    <>
      <style>{`
        .responsive-container {
          width: 100%; max-width: 1400px; margin: 0 auto;
          padding-left: 40px; padding-right: 40px;
        }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .reg-hero {
          position: relative; background-image: url('/site-images/library.jpg');
          background-size: cover; background-position: center;
          background-color: #2B3490; min-height: 320px; display: flex;
          align-items: flex-end; overflow: hidden; padding-bottom: 40px;
        }
        .reg-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%);
          z-index: 0;
        }
        .reg-hero > * {
          position: relative;
          z-index: 1;
        }
        .reg-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #D4A500;
        }
        .reg-breadcrumb {
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; color: rgba(255,255,255,0.7); margin-top: 24px;
        }
        .reg-breadcrumb a { color: #D4A500; text-decoration: none; }
        .reg-breadcrumb span { color: #D4A500; }

        .reg-card-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px; margin-top: 40px;
        }
        .reg-card {
          background: #fff; border: 1px solid #eef0f3; border-radius: 12px;
          padding: 28px; display: flex; flex-direction: column; gap: 16px; transition: all 0.2s;
        }
        .reg-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(43,52,144,0.12); border-color: #D4A500; }
        .reg-code-badge {
          display: inline-block; background: #D4A500; color: #2B3490;
          padding: 6px 12px; border-radius: 6px; font-family: 'Rajdhani', sans-serif;
          font-size: 12px; font-weight: 700; width: fit-content;
        }
        .reg-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0; }
        .reg-card-meta { display: flex; flex-direction: column; gap: 8px; font-size: 13px; color: #666; }
        .reg-card-meta strong { color: #2B3490; font-weight: 700; }
        .reg-card-description { font-size: 14px; color: #555; line-height: 1.6; margin: 0; }
        .reg-keypoints { display: flex; flex-direction: column; gap: 8px; }
        .reg-keypoint { font-size: 13px; color: #555; padding-left: 20px; position: relative; }
        .reg-keypoint::before { content: "✓"; position: absolute; left: 0; color: #2B3490; font-weight: 700; }
        .reg-download-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: #D4A500; color: #2B3490; padding: 8px 14px; border-radius: 6px;
          font-size: 12px; font-weight: 700; font-family: 'Rajdhani', sans-serif;
          text-decoration: none; border: none; cursor: pointer; transition: all 0.2s; width: fit-content;
        }
        .reg-download-btn:hover { background: #ffd700; transform: translateY(-2px); }

        .reg-rules-accordion { display: flex; flex-direction: column; gap: 12px; margin-top: 40px; }
        .reg-rule-item { background: #fff; border: 1px solid #eef0f3; border-radius: 8px; overflow: hidden; }
        .reg-rule-header {
          background: #f4f3ef; border-left: 4px solid #2B3490; padding: 16px 20px; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; color: #2B3490;
          transition: all 0.2s; border-top: 1px solid #eef0f3; border-right: 1px solid #eef0f3; border-bottom: 1px solid #eef0f3; width: 100%;
        }
        .reg-rule-header:hover { background: #fffaed; }
        .reg-rule-header .reg-chevron { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; transition: transform 0.3s; }
        .reg-rule-item.expanded .reg-rule-header .reg-chevron { transform: rotate(180deg); }
        .reg-rule-content { padding: 0 20px; background: #ffffff; max-height: 0; overflow: hidden; transition: max-height 0.3s ease; }
        .reg-rule-item.expanded .reg-rule-content { max-height: 500px; padding: 20px; }
        .reg-rule-content p { color: #555; font-size: 14px; line-height: 1.7; margin: 0; }

        .reg-note { background: #f4f3ef; border-left: 4px solid #2B3490; padding: 24px; border-radius: 8px; margin-top: 40px; }
        .reg-note p { color: #555; font-size: 15px; line-height: 1.7; margin: 0; }

        @media (max-width: 900px) { .reg-card-grid { grid-template-columns: 1fr; } }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="reg-hero" style={{ backgroundImage: "url('/banners/regulations.png')", position: "relative" }}>
          <div className="responsive-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ padding: "72px 0" }}>
              <div className="reg-eyebrow" style={{ marginBottom: 16 }}>Academics</div>
              <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>Regulations</h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 300, maxWidth: 700 }}>Academic Rules and Guidelines</p>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0, maxWidth: 820 }}>
              KSRM College of Engineering follows comprehensive regulations for all academic programmes as
              prescribed by JNTUA (Jawaharlal Nehru Technological University Ananthapuramu). These regulations
              govern admission, curriculum, assessment, and graduation requirements. Students are expected to
              adhere to all regulations outlined in this section.
            </p>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}>
              Academic Regulations
            </h2>
            <div className="reg-card-grid">
              {regulations.map((r) => (
                <div className="reg-card" key={r.code}>
                  <div className="reg-code-badge">{r.code}</div>
                  <h3>{r.code} Regulations ({r.year})</h3>
                  <div className="reg-card-meta"><div><strong>Applicable To:</strong> {r.applicable}</div></div>
                  <p className="reg-card-description">{r.description}</p>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#2B3490", marginBottom: 8 }}>KEY POINTS</div>
                    <div className="reg-keypoints">
                      {r.keyPoints.map((kp) => <div className="reg-keypoint" key={kp}>{kp}</div>)}
                    </div>
                  </div>
                  <a href={r.pdf} className="reg-download-btn" target="_blank" rel="noopener noreferrer">
                    <DownloadIcon />Download PDF
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}>
              Examination and Assessment Rules
            </h2>
            <div className="reg-rules-accordion">
              {examRules.map((rule) => <RuleItem key={rule.title} title={rule.title} text={rule.text} />)}
            </div>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <div className="reg-note">
              <p>All regulations are subject to amendments as per directives from JNTUA and APSCHE (Andhra Pradesh
              State Council for Higher Education). Students are advised to refer to the official regulation
              documents and check with their respective departments for any clarifications or updates. The college
              reserves the right to modify regulations to ensure quality education and regulatory compliance.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
