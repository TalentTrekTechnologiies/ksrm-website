"use client";

const missionFunctions = [
  "Development of quality benchmarks",
  "Creating learner-centric environment",
  "Feedback from students & parents",
  "Dissemination of quality parameters",
  "Organization of workshops",
  "Documentation of improvements",
  "Quality Culture development",
  "Preparation of AQAR",
];

const strategies = [
  "Timely and progressive performance of academic, administrative tasks",
  "Relevance and quality of academic and research programmes",
  "Equitable access and affordability for all sections",
  "Optimization of modern methods of teaching and learning",
  "Credibility of evaluation procedures",
];

const qualityPolicy = [
  "By Imparting truly Global Focused Education",
  "By Creating World Class Professionals",
  "By Establishing Synergic Relationships with Research hub and Society",
  "By Developing State-of-art Infrastructure and Well Endowed Faculty",
  "By Imparting Knowledge Through Team Work and Incessant Effort",
];

const composition = [
  { name: "Prof. T. Nageswara Prasad", designation: "Principal", role: "Chairperson" },
  { name: "Sri K. Madan Mohan Reddy", designation: "Vice-Chairman", role: "Management" },
  { name: "Prof. T. Nageswara Prasad", designation: "Dean, Academics", role: "Member" },
  { name: "Dr. M. Venkatanarayana", designation: "Dean, R&D", role: "Member" },
  { name: "Mr. A. Ramprakash Reddy", designation: "Dean, Faculty Affairs", role: "Member" },
  { name: "Mrs. B. Manorama Devi", designation: "Dean, Student Affairs", role: "Member" },
  { name: "Mr. R. Nagaraju", designation: "Dean, Training & Placements", role: "Member" },
  { name: "Dr. N. Amaranatha Reddy", designation: "Dean, Alumni", role: "Member" },
  { name: "Dr. M. Venugopal", designation: "Dean, Industry Relations", role: "Member" },
  { name: "Dr. V. Giridhar", designation: "Dean, Industry Institution Cell", role: "Member" },
  { name: "Dr. T. Elia", designation: "Dean, Innovation & Entrepreneurship", role: "Member" },
  { name: "Dr. M. V. Ravi Kishore Reddy", designation: "Controller of Examinations", role: "Member" },
  { name: "Dr. G. Chennakesava Reddy", designation: "HoD, Civil", role: "Member" },
  { name: "Dr. M.S. Priyadarshini", designation: "HoD, EEE", role: "Member" },
  { name: "Mr. K. Suresh Kumar", designation: "HoD, Mechanical", role: "Member" },
  { name: "Dr. M. Venkatanarayana", designation: "HoD, ECE", role: "Member" },
  { name: "Dr. V. Lokeswara Reddy", designation: "HoD, CSE", role: "Member" },
  { name: "Dr. V. Ramachandra Reddy", designation: "HoD, H&S", role: "Member" },
  { name: "Dr. N. Suhasini", designation: "HoD, MBA", role: "Member" },
  { name: "Mrs. G. Sireesha", designation: "Manager, Broadcom", role: "Member" },
  { name: "Mr. S. Guru Sankar", designation: "MD, Chaitanya Chemicals", role: "Member" },
  { name: "Mr. K. Subramanyam", designation: "Health Coordinator", role: "Member" },
  { name: "Mr. M. Vara Prasad Reddy", designation: "Deputy Executive Engineer", role: "Member" },
  { name: "Mr. M. Obul Das", designation: "DAS Educational & Welfare NGO", role: "Member" },
  { name: "Ms. K. Shanmukhi Lasya", designation: "Student", role: "Member" },
  { name: "Mr. B. Bala Subramanyam", designation: "Student", role: "Member" },
  { name: "Mrs. K. HarshaVardhini", designation: "Student", role: "Member" },
  { name: "Dr. V. Vijaya Kishore", designation: "Prof., ECE", role: "Coordinator" },
  { name: "Dr. I. Srinivasula Reddy", designation: "Asso. Prof., CE", role: "Dy. Dean" },
  { name: "Mr. P. Suresh Praveen Kumar", designation: "Asst. Prof., CE", role: "Asso. Dean" },
  { name: "Dr. C. Kumar Reddy", designation: "Asso. Prof., EEE", role: "Asso. Dean" },
  { name: "Mr. A. HariKrishna", designation: "Asst. Prof., ME", role: "Asso. Dean" },
  { name: "Dr. K. Pavan Kumar", designation: "Asso. Prof., ECE", role: "Asso. Dean" },
  { name: "Mrs. B. Swetha", designation: "Asst. Prof., CSE", role: "Asso. Dean" },
  { name: "Dr. M. Vijaya Bhaskar Reddy", designation: "Asso. Prof., H&S", role: "Asso. Dean" },
];

const minutesYears = ["2022-23", "2021-22", "2020-21", "2019-20", "2018-19", "2017-18", "2016-17", "2015-16", "2014-15", "2013-14"];

const aqarReports = [
  { label: "2021-2022", href: "https://ksrmce.ac.in/IQAC/AQAR 2021-22.pdf" },
  { label: "2020-2021", href: "https://ksrmce.ac.in/IQAC/AQAR 2020-21.pdf" },
  { label: "2019-2020", href: "https://ksrmce.ac.in/IQAC/AQAR-2019-20.pdf" },
  { label: "2018-2019", href: "https://ksrmce.ac.in/IQAC/AQAR-2018-19.pdf" },
  { label: "2017-2018", href: "https://ksrmce.ac.in/IQAC/AQAR.2017-18.pdf" },
  { label: "2016-2017", href: "https://ksrmce.ac.in/IQAC/AQAR-2016-17.pdf" },
  { label: "2015-2016", href: "https://ksrmce.ac.in/IQAC/AQAR-2015-16.pdf" },
  { label: "2014-2015", href: "https://ksrmce.ac.in/IQAC/AQAR-2014-15.pdf" },
  { label: "2013-2014", href: "https://ksrmce.ac.in/IQAC/AQAR-2013-14.pdf" },
];

const surveys = [
  { label: "2023-2024", href: "https://ksrmce.ac.in/IQAC/Student_Satisfaction_Survey-AY2023-24.pdf" },
  { label: "2021-2022", href: "https://ksrmce.ac.in/IQAC/2.7.1. Student Satisfaction Survey.pdf" },
  { label: "2020-2021", href: "https://ksrmce.ac.in/IQAC/SSS-2020-21.pdf" },
  { label: "2019-2020", href: "https://ksrmce.ac.in/SSS2019-20.pdf" },
  { label: "2018-2019", href: "https://ksrmce.ac.in/Student_Survey_Analysis_2018-2019.pdf" },
];

const feedbackForms = [
  { label: "Alumni Feedback", href: "https://ksrmce.ac.in/AlumniFeedback.php" },
  { label: "Student Feedback", href: "https://ksrmce.ac.in/StudentFeedback.php" },
  { label: "Parent Feedback", href: "https://ksrmce.ac.in/ParentFeedback.php" },
  { label: "Teacher Feedback", href: "https://ksrmce.ac.in/TeacherFeedback.php" },
  { label: "Employer Feedback", href: "https://ksrmce.ac.in/EmployerFeedback.php" },
];

const apexBodies = [
  { icon: "🏛️", label: "Governing Body", href: "https://ksrmce.ac.in/gbody.php" },
  { icon: "🎓", label: "Academic Council", href: "https://ksrmce.ac.in/academiccouncil.php" },
  { icon: "💰", label: "Finance Committee", href: "https://ksrmce.ac.in/financial.php" },
];

const tabs = [
  { label: "📋 About IQAC", id: "about" },
  { label: "👥 Composition", id: "composition" },
  { label: "📅 Minutes & Agenda", id: "minutes" },
  { label: "📊 AQAR Reports", id: "aqar" },
  { label: "📝 Student Survey", id: "survey" },
  { label: "🏛️ Apex Bodies", id: "apex" },
  { label: "📞 Contact", id: "contact" },
];

export default function IQACPage() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { width: 100%; max-width: 1400px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .iqac-tab-btn {
          background: #2B3490; color: #D4A500; padding: 8px 16px; border-radius: 6px; font-weight: 600;
          font-size: 13px; border: none; cursor: pointer; text-decoration: none; white-space: nowrap;
        }
        .iqac-about-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; margin-bottom: 48px; }
        @media (max-width: 1024px) { .iqac-about-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; } }
        @media (max-width: 640px) { .iqac-about-grid { grid-template-columns: 1fr; gap: 20px; } }

        .iqac-table-wrapper { overflow-x: auto; }
        .iqac-table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
        .iqac-table thead tr { background: #2B3490; color: white; }
        .iqac-table th { padding: 14px 16px; text-align: left; font-size: 13px; font-weight: 700; }
        .iqac-table td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #e5e7eb; }
        @media (max-width: 640px) { .iqac-table th, .iqac-table td { padding: 10px 12px; font-size: 12px; } }

        .iqac-minutes-btn {
          background: #f4f3ef; padding: 16px 20px; width: 100%; text-align: left; font-weight: 700;
          color: #2B3490; font-size: 16px; cursor: pointer; border: none; border-bottom: 1px solid #e5e7eb;
          display: flex; justify-content: space-between; align-items: center;
        }
        .iqac-doc-link {
          background: white; border: 1px solid #ddd; border-radius: 8px; padding: 20px; display: flex;
          align-items: center; gap: 16px; text-decoration: none; transition: all 0.2s;
        }
        .iqac-feedback-btn {
          background: #2B3490; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none;
          font-size: 14px; font-weight: 600; display: inline-block;
        }
        .iqac-apex-card {
          background: white; border-radius: 12px; padding: 40px; text-align: center; border: 1px solid #e5e7eb;
          text-decoration: none;
        }
        .iqac-apex-btn {
          background: #2B3490; color: #D4A500; padding: 12px 28px; border-radius: 6px; text-decoration: none;
          font-weight: 700; font-size: 14px; display: inline-block;
        }
        .iqac-contact-link {
          display: flex; gap: 12px; padding: 10px 16px; background: rgba(255,230,25,0.1); border-radius: 4px;
          color: #2B3490; font-weight: 600; font-size: 14px; text-decoration: none; margin-bottom: 8px;
        }
      `}</style>

      {/* HERO */}
      <section style={{ backgroundImage: "url('/banners/iqac banner.webp')", backgroundSize: "cover", backgroundPosition: "center", backgroundColor: "#2B3490", padding: "80px 0", color: "white", position: "relative", minHeight: 320, display: "flex", alignItems: "flex-end", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
          <div className="responsive-container">
            <div style={{ display: "inline-block", background: "#D4A500", color: "#2B3490", padding: "8px 20px", borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>
              ⭐ Quality Assurance
            </div>
            <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", margin: "0 0 8px" }}>
              Internal Quality Assurance Cell
            </h1>
            <p style={{ fontSize: 20, fontWeight: 600, color: "#D4A500", margin: "0 0 24px" }}>IQAC — KSRM College of Engineering</p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 1.8, maxWidth: 700, margin: 0 }}>
              IQAC was established on 18-01-2012 following NAAC norms. It consists of representatives of all
              stakeholders, committed to institutional quality enhancement through internalization of quality
              culture and best practices.
            </p>
          </div>
        </div>
      </section>

      {/* STICKY TABS */}
      <div style={{ position: "sticky", top: 0, zIndex: 100, background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: "16px 0", overflowX: "auto" }}>
        <div className="responsive-container">
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {tabs.map((t) => (
              <button key={t.id} className="iqac-tab-btn" onClick={() => scrollTo(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>
            About IQAC
          </h2>
          <div className="iqac-about-grid">
            <div style={{ background: "#f9f9f9", borderTop: "4px solid #D4A500", borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16 }}>🎯 Aim</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                <li style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 12, display: "flex", gap: 8 }}>
                  <span style={{ width: 6, height: 6, background: "#D4A500", borderRadius: "50%", marginTop: 6, flexShrink: 0 }} />
                  To develop a system for conscious, consistent and catalytic action to improve academic and
                  administrative performance.
                </li>
                <li style={{ fontSize: 14, color: "#555", lineHeight: 1.8, display: "flex", gap: 8 }}>
                  <span style={{ width: 6, height: 6, background: "#D4A500", borderRadius: "50%", marginTop: 6, flexShrink: 0 }} />
                  To promote measures for institutional functioning towards quality enhancement through
                  internalization of quality culture.
                </li>
              </ul>
            </div>
            <div style={{ background: "#f9f9f9", borderTop: "4px solid #2B3490", borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16 }}>⚙️ Strategies</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {strategies.map((s) => (
                  <li key={s} style={{ fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 8, display: "flex", gap: 8 }}>
                    <span style={{ width: 5, height: 5, background: "#D4A500", borderRadius: "50%", marginTop: 5, flexShrink: 0 }} />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: "#f9f9f9", borderTop: "4px solid #e63946", borderRadius: 12, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16 }}>🔧 Functions</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {missionFunctions.map((f) => (
                  <li key={f} style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginBottom: 6, display: "flex", gap: 8 }}>
                    <span style={{ width: 4, height: 4, background: "#D4A500", borderRadius: "50%", marginTop: 5, flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div style={{ background: "linear-gradient(135deg, #2B3490, #1a1d4d)", borderRadius: 12, padding: 40, color: "white" }}>
            <h3 style={{ color: "#D4A500", fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Quality Policy</h3>
            <p style={{ fontSize: 16, marginBottom: 20, lineHeight: 1.8 }}>
              KSRM is committed to achieve excellence in Teaching, Research and Consultancy
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {qualityPolicy.map((q) => (
                <li key={q} style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 8, display: "flex", gap: 8 }}>
                  <span style={{ width: 6, height: 6, background: "#D4A500", borderRadius: "50%", marginTop: 6, flexShrink: 0 }} />
                  {q}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* COMPOSITION */}
      <section id="composition" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}>
            IQAC Composition (35 Members)
          </h2>
          <div className="iqac-table-wrapper">
            <table className="iqac-table">
              <thead>
                <tr><th>S.No</th><th>Name</th><th>Designation</th><th>Role</th></tr>
              </thead>
              <tbody>
                {composition.map((c, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "white" : "#f9f9f9" }}>
                    <td style={{ color: "#2B3490", fontWeight: 600 }}>{i + 1}</td>
                    <td style={{ color: "#333" }}>{c.name}</td>
                    <td style={{ color: "#666" }}>{c.designation}</td>
                    <td>
                      {c.role === "Chairperson" || c.role === "Coordinator" ? (
                        <span style={{ background: "#2B3490", color: "#D4A500", fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>
                          {c.role}
                        </span>
                      ) : c.role}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* MINUTES */}
      <section id="minutes" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}>
            Minutes of Meeting
          </h2>
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            {minutesYears.map((y) => (
              <div key={y} style={{ marginBottom: 8 }}>
                <button className="iqac-minutes-btn">{y}<span style={{ fontSize: 12 }}>▼</span></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AQAR */}
      <section id="aqar" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}>
            AQAR Reports
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {aqarReports.map((r) => (
              <a href={r.href} target="_blank" rel="noopener noreferrer" className="iqac-doc-link" key={r.label}>
                <div style={{ background: "#eef1ff", width: 44, height: 44, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📊</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#2B3490", fontSize: 14, marginBottom: 4 }}>AQAR Report {r.label}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>Annual Quality Assurance Report</div>
                </div>
                <div style={{ fontSize: 18, color: "#D4A500" }}>⬇</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SURVEY */}
      <section id="survey" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}>
            Student Satisfaction Survey
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16, marginBottom: 48 }}>
            {surveys.map((s) => (
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="iqac-doc-link" key={s.label}>
                <div style={{ background: "#eef1ff", width: 44, height: 44, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📝</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#2B3490", fontSize: 14, marginBottom: 4 }}>Survey {s.label}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>Student Satisfaction Report</div>
                </div>
                <div style={{ fontSize: 18, color: "#D4A500" }}>⬇</div>
              </a>
            ))}
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#2B3490", marginBottom: 20, textAlign: "center" }}>Feedback Forms</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {feedbackForms.map((f) => (
              <a href={f.href} target="_blank" rel="noopener noreferrer" className="iqac-feedback-btn" key={f.label}>{f.label}</a>
            ))}
          </div>
        </div>
      </section>

      {/* APEX */}
      <section id="apex" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}>
            Apex Bodies
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {apexBodies.map((a) => (
              <a href={a.href} target="_blank" rel="noopener noreferrer" className="iqac-apex-card" key={a.label}>
                <div style={{ fontSize: 48, marginBottom: 16, display: "block" }}>{a.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#2B3490", marginBottom: 20 }}>{a.label}</div>
                <div className="iqac-apex-btn">View Details →</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 40, textAlign: "center" }}>
            Contact IQAC
          </h2>
          <div style={{ maxWidth: 600, margin: "0 auto", border: "2px solid #D4A500", borderRadius: 12, padding: 40 }}>
            <div style={{ fontWeight: 700, fontSize: 20, color: "#2B3490", marginBottom: 8 }}>Internal Quality Assurance Cell (IQAC)</div>
            <div style={{ fontSize: 15, color: "#666", marginBottom: 32 }}>K.S.R.M. College of Engineering (Autonomous)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="mailto:dean.iqac@ksrmce.ac.in" className="iqac-contact-link"><span>📧</span><span>dean.iqac@ksrmce.ac.in</span></a>
              <a href="mailto:iqac@ksrmce.ac.in" className="iqac-contact-link"><span>📧</span><span>iqac@ksrmce.ac.in</span></a>
              <a href="tel:+918499918303" className="iqac-contact-link"><span>📞</span><span>+91 8499918303</span></a>
              <a href="tel:+918985717578" className="iqac-contact-link"><span>📞</span><span>+91 8985717578</span></a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
