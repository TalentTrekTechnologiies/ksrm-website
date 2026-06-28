"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import Container from "@/components/ui/Container"

const EASE = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// IQAC Members Data
const iqacMembers = [
  { sNo: 1, name: "Prof. T. Nageswara Prasad", designation: "Principal", role: "Chairperson" },
  { sNo: 2, name: "Sri K. Madan Mohan Reddy", designation: "Vice-Chairman", role: "Management" },
  { sNo: 3, name: "Prof. T. Nageswara Prasad", designation: "Dean, Academics", role: "Member" },
  { sNo: 4, name: "Dr. M. Venkatanarayana", designation: "Dean, R&D", role: "Member" },
  { sNo: 5, name: "Mr. A. Ramprakash Reddy", designation: "Dean, Faculty Affairs", role: "Member" },
  { sNo: 6, name: "Mrs. B. Manorama Devi", designation: "Dean, Student Affairs", role: "Member" },
  { sNo: 7, name: "Mr. R. Nagaraju", designation: "Dean, Training & Placements", role: "Member" },
  { sNo: 8, name: "Dr. N. Amaranatha Reddy", designation: "Dean, Alumni", role: "Member" },
  { sNo: 9, name: "Dr. M. Venugopal", designation: "Dean, Industry Relations", role: "Member" },
  { sNo: 10, name: "Dr. V. Giridhar", designation: "Dean, Industry Institution Cell", role: "Member" },
  { sNo: 11, name: "Dr. T. Elia", designation: "Dean, Innovation & Entrepreneurship", role: "Member" },
  { sNo: 12, name: "Dr. M. V. Ravi Kishore Reddy", designation: "Controller of Examinations", role: "Member" },
  { sNo: 13, name: "Dr. G. Chennakesava Reddy", designation: "HoD, Civil", role: "Member" },
  { sNo: 14, name: "Dr. M.S. Priyadarshini", designation: "HoD, EEE", role: "Member" },
  { sNo: 15, name: "Mr. K. Suresh Kumar", designation: "HoD, Mechanical", role: "Member" },
  { sNo: 16, name: "Dr. M. Venkatanarayana", designation: "HoD, ECE", role: "Member" },
  { sNo: 17, name: "Dr. V. Lokeswara Reddy", designation: "HoD, CSE", role: "Member" },
  { sNo: 18, name: "Dr. V. Ramachandra Reddy", designation: "HoD, H&S", role: "Member" },
  { sNo: 19, name: "Dr. N. Suhasini", designation: "HoD, MBA", role: "Member" },
  { sNo: 20, name: "Mrs. G. Sireesha", designation: "Manager, Broadcom", role: "Member" },
  { sNo: 21, name: "Mr. S. Guru Sankar", designation: "MD, Chaitanya Chemicals", role: "Member" },
  { sNo: 22, name: "Mr. K. Subramanyam", designation: "Health Coordinator", role: "Member" },
  { sNo: 23, name: "Mr. M. Vara Prasad Reddy", designation: "Deputy Executive Engineer", role: "Member" },
  { sNo: 24, name: "Mr. M. Obul Das", designation: "DAS Educational & Welfare NGO", role: "Member" },
  { sNo: 25, name: "Ms. K. Shanmukhi Lasya", designation: "Student", role: "Member" },
  { sNo: 26, name: "Mr. B. Bala Subramanyam", designation: "Student", role: "Member" },
  { sNo: 27, name: "Mrs. K. HarshaVardhini", designation: "Student", role: "Member" },
  { sNo: 28, name: "Dr. V. Vijaya Kishore", designation: "Prof., ECE", role: "Coordinator" },
  { sNo: 29, name: "Dr. I. Srinivasula Reddy", designation: "Asso. Prof., CE", role: "Dy. Dean" },
  { sNo: 30, name: "Mr. P. Suresh Praveen Kumar", designation: "Asst. Prof., CE", role: "Asso. Dean" },
  { sNo: 31, name: "Dr. C. Kumar Reddy", designation: "Asso. Prof., EEE", role: "Asso. Dean" },
  { sNo: 32, name: "Mr. A. HariKrishna", designation: "Asst. Prof., ME", role: "Asso. Dean" },
  { sNo: 33, name: "Dr. K. Pavan Kumar", designation: "Asso. Prof., ECE", role: "Asso. Dean" },
  { sNo: 34, name: "Mrs. B. Swetha", designation: "Asst. Prof., CSE", role: "Asso. Dean" },
  { sNo: 35, name: "Dr. M. Vijaya Bhaskar Reddy", designation: "Asso. Prof., H&S", role: "Asso. Dean" },
]

const navLinks = [
  { id: "about", label: "📋 About IQAC" },
  { id: "composition", label: "👥 Composition" },
  { id: "minutes", label: "📅 Minutes & Agenda" },
  { id: "aqar", label: "📊 AQAR Reports" },
  { id: "survey", label: "📝 Student Survey" },
  { id: "apex", label: "🏛️ Apex Bodies" },
  { id: "contact", label: "📞 Contact" },
]

const minutes = [
  { year: "2022-23", dates: ["07-11-2022", "08-03-2023", "29-05-2023"] },
  { year: "2021-22", dates: ["02-08-2021", "02-11-2021", "07-02-2022", "13-05-2022"] },
  { year: "2020-21", dates: ["06-08-2020", "05-01-2021", "26-02-2021", "06-05-2021"] },
  { year: "2019-20", dates: ["24-09-2019"] },
  { year: "2018-19", dates: ["20-09-2018", "22-12-2018", "27-04-2019"] },
  { year: "2017-18", dates: ["24-07-2017", "08-12-2017", "31-03-2018"] },
  { year: "2016-17", dates: ["18-07-2016", "27-01-2017"] },
  { year: "2015-16", dates: ["06-07-2015", "28-01-2016"] },
  { year: "2014-15", dates: ["27-06-2014", "22-01-2015"] },
  { year: "2013-14", dates: ["28-06-2013", "06-01-2014"] },
]

const aqarReports = [
  { year: "2021-2022", url: "https://ksrmce.ac.in/IQAC/AQAR 2021-22.pdf" },
  { year: "2020-2021", url: "https://ksrmce.ac.in/IQAC/AQAR 2020-21.pdf" },
  { year: "2019-2020", url: "https://ksrmce.ac.in/IQAC/AQAR-2019-20.pdf" },
  { year: "2018-2019", url: "https://ksrmce.ac.in/IQAC/AQAR-2018-19.pdf" },
  { year: "2017-2018", url: "https://ksrmce.ac.in/IQAC/AQAR.2017-18.pdf" },
  { year: "2016-2017", url: "https://ksrmce.ac.in/IQAC/AQAR-2016-17.pdf" },
  { year: "2015-2016", url: "https://ksrmce.ac.in/IQAC/AQAR-2015-16.pdf" },
  { year: "2014-2015", url: "https://ksrmce.ac.in/IQAC/AQAR-2014-15.pdf" },
  { year: "2013-2014", url: "https://ksrmce.ac.in/IQAC/AQAR-2013-14.pdf" },
]

const surveys = [
  { year: "2023-2024", url: "https://ksrmce.ac.in/IQAC/Student_Satisfaction_Survey-AY2023-24.pdf" },
  { year: "2021-2022", url: "https://ksrmce.ac.in/IQAC/2.7.1. Student Satisfaction Survey.pdf" },
  { year: "2020-2021", url: "https://ksrmce.ac.in/IQAC/SSS-2020-21.pdf" },
  { year: "2019-2020", url: "https://ksrmce.ac.in/SSS2019-20.pdf" },
  { year: "2018-2019", url: "https://ksrmce.ac.in/Student_Survey_Analysis_2018-2019.pdf" },
]

const feedbackForms = [
  { label: "Alumni Feedback", url: "https://ksrmce.ac.in/AlumniFeedback.php" },
  { label: "Student Feedback", url: "https://ksrmce.ac.in/StudentFeedback.php" },
  { label: "Parent Feedback", url: "https://ksrmce.ac.in/ParentFeedback.php" },
  { label: "Teacher Feedback", url: "https://ksrmce.ac.in/TeacherFeedback.php" },
  { label: "Employer Feedback", url: "https://ksrmce.ac.in/EmployerFeedback.php" },
]

const apexBodies = [
  { name: "Governing Body", url: "https://ksrmce.ac.in/gbody.php", icon: "🏛️" },
  { name: "Academic Council", url: "https://ksrmce.ac.in/academiccouncil.php", icon: "🎓" },
  { name: "Finance Committee", url: "https://ksrmce.ac.in/financial.php", icon: "💰" },
]

export default function IQACTemplate() {
  const [openYear, setOpenYear] = useState<string | null>(null)

  return (
    <main style={{ background: "#ffffff" }}>
      {/* SECTION 1 — HERO BANNER */}
      <section style={{
        backgroundImage: "url('/banners/iqac-banner.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#2B3490",
        padding: "80px 0",
        color: "white",
        position: "relative",
        minHeight: "320px",
        display: "flex",
        alignItems: "flex-end",
        overflow: "hidden",
      }}>
        {/* Overlay */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.4) 100%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
        <Container>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <div style={{ textAlign: "left", marginBottom: 32 }}>
              <div style={{
                display: "inline-block",
                background: "#D4A500",
                color: "#2B3490",
                padding: "8px 20px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: 20,
              }}>
                ⭐ Quality Assurance
              </div>

              <motion.h1 variants={fadeUp} style={{
                fontSize: "clamp(2.2rem, 4vw, 3.6rem)",
                fontWeight: 800,
                fontFamily: "'Rajdhani', sans-serif",
                margin: "0 0 8px",
              }}>
                Internal Quality Assurance Cell
              </motion.h1>

              <motion.p variants={fadeUp} style={{
                fontSize: 20,
                fontWeight: 600,
                color: "#D4A500",
                margin: "0 0 24px",
              }}>
                IQAC — KSRM College of Engineering
              </motion.p>

              <motion.p variants={fadeUp} style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.9)",
                lineHeight: 1.8,
                maxWidth: "700px",
                margin: "0",
              }}>
                IQAC was established on 18-01-2012 following NAAC norms. It consists of representatives of all stakeholders, committed to institutional quality enhancement through internalization of quality culture and best practices.
              </motion.p>
            </div>
          </motion.div>
        </Container>
        </div>
      </section>

      {/* SECTION 2 — STICKY ANCHOR NAV */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        padding: "16px 0",
        overflowX: "auto",
      }}>
        <Container>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                style={{
                  background: "#2B3490",
                  color: "#D4A500",
                  padding: "8px 16px",
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 13,
                  border: "none",
                  cursor: "pointer",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </Container>
      </div>

      {/* SECTION 3 — ABOUT IQAC */}
      <section id="about" style={{ padding: "80px 0", background: "white" }}>
        <Container>
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <h2 style={{
              fontSize: "clamp(2rem, 3vw, 2.6rem)",
              fontWeight: 800,
              fontFamily: "'Rajdhani', sans-serif",
              color: "#2B3490",
              marginBottom: 48,
              textAlign: "center",
            }}>
              About IQAC
            </h2>

            <style>{`
              .iqac-about-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 32px;
                margin-bottom: 48px;
              }
              @media (max-width: 1024px) {
                .iqac-about-grid { grid-template-columns: repeat(2, 1fr); gap: 24px; }
              }
              @media (max-width: 640px) {
                .iqac-about-grid { grid-template-columns: 1fr; gap: 20px; }
              }
            `}</style>

            <div className="iqac-about-grid">
              {/* AIM CARD */}
              <motion.div variants={fadeUp} style={{
                background: "#f9f9f9",
                borderTop: "4px solid #D4A500",
                borderRadius: 12,
                padding: 28,
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16 }}>🎯 Aim</h3>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                  <li style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 12, display: "flex", gap: 8 }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      background: "#D4A500",
                      borderRadius: "50%",
                      marginTop: 6,
                      flexShrink: 0,
                    }} />
                    To develop a system for conscious, consistent and catalytic action to improve academic and administrative performance.
                  </li>
                  <li style={{ fontSize: 14, color: "#555", lineHeight: 1.8, display: "flex", gap: 8 }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      background: "#D4A500",
                      borderRadius: "50%",
                      marginTop: 6,
                      flexShrink: 0,
                    }} />
                    To promote measures for institutional functioning towards quality enhancement through internalization of quality culture.
                  </li>
                </ul>
              </motion.div>

              {/* STRATEGIES CARD */}
              <motion.div variants={fadeUp} style={{
                background: "#f9f9f9",
                borderTop: "4px solid #2B3490",
                borderRadius: 12,
                padding: 28,
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16 }}>⚙️ Strategies</h3>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                  {[
                    "Timely and progressive performance of academic, administrative tasks",
                    "Relevance and quality of academic and research programmes",
                    "Equitable access and affordability for all sections",
                    "Optimization of modern methods of teaching and learning",
                    "Credibility of evaluation procedures",
                  ].map((item, idx) => (
                    <li key={idx} style={{ fontSize: 14, color: "#555", lineHeight: 1.6, marginBottom: 8, display: "flex", gap: 8 }}>
                      <span style={{
                        width: 5,
                        height: 5,
                        background: "#D4A500",
                        borderRadius: "50%",
                        marginTop: 5,
                        flexShrink: 0,
                      }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* FUNCTIONS CARD */}
              <motion.div variants={fadeUp} style={{
                background: "#f9f9f9",
                borderTop: "4px solid #e63946",
                borderRadius: 12,
                padding: 28,
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16 }}>🔧 Functions</h3>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                  {[
                    "Development of quality benchmarks",
                    "Creating learner-centric environment",
                    "Feedback from students & parents",
                    "Dissemination of quality parameters",
                    "Organization of workshops",
                    "Documentation of improvements",
                    "Quality Culture development",
                    "Preparation of AQAR",
                  ].map((item, idx) => (
                    <li key={idx} style={{ fontSize: 13, color: "#555", lineHeight: 1.5, marginBottom: 6, display: "flex", gap: 8 }}>
                      <span style={{
                        width: 4,
                        height: 4,
                        background: "#D4A500",
                        borderRadius: "50%",
                        marginTop: 5,
                        flexShrink: 0,
                      }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* QUALITY POLICY BOX */}
            <motion.div variants={fadeUp} style={{
              background: "linear-gradient(135deg, #2B3490, #1a1d4d)",
              borderRadius: 12,
              padding: 40,
              color: "white",
            }}>
              <h3 style={{ color: "#D4A500", fontSize: 22, fontWeight: 700, marginBottom: 16 }}>Quality Policy</h3>
              <p style={{ fontSize: 16, marginBottom: 20, lineHeight: 1.8 }}>
                KSRM is committed to achieve excellence in Teaching, Research and Consultancy
              </p>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                {[
                  "By Imparting truly Global Focused Education",
                  "By Creating World Class Professionals",
                  "By Establishing Synergic Relationships with Research hub and Society",
                  "By Developing State-of-art Infrastructure and Well Endowed Faculty",
                  "By Imparting Knowledge Through Team Work and Incessant Effort",
                ].map((item, idx) => (
                  <li key={idx} style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 8, display: "flex", gap: 8 }}>
                    <span style={{
                      width: 6,
                      height: 6,
                      background: "#D4A500",
                      borderRadius: "50%",
                      marginTop: 6,
                      flexShrink: 0,
                    }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 4 — IQAC COMPOSITION TABLE */}
      <section id="composition" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h2 style={{
              fontSize: "clamp(2rem, 3vw, 2.6rem)",
              fontWeight: 800,
              fontFamily: "'Rajdhani', sans-serif",
              color: "#2B3490",
              marginBottom: 40,
              textAlign: "center",
            }}>
              IQAC Composition (35 Members)
            </h2>

            <style>{`
              .iqac-table-wrapper {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
              }
              .iqac-table {
                width: 100%;
                border-collapse: collapse;
                background: white;
                border-radius: 8px;
                overflow: hidden;
              }
              .iqac-table thead tr {
                background: #2B3490;
                color: white;
              }
              .iqac-table th {
                padding: 14px 16px;
                text-align: left;
                font-size: 13px;
                font-weight: 700;
              }
              .iqac-table td {
                padding: 12px 16px;
                font-size: 13px;
                border-bottom: 1px solid #e5e7eb;
              }
              @media (max-width: 640px) {
                .iqac-table th,
                .iqac-table td {
                  padding: 10px 12px;
                  font-size: 12px;
                }
              }
            `}</style>

            <div className="iqac-table-wrapper">
              <table className="iqac-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {iqacMembers.map((member, idx) => (
                    <tr
                      key={idx}
                      style={{
                        background: idx % 2 === 0 ? "white" : "#f9f9f9",
                      }}
                    >
                      <td style={{ color: "#2B3490", fontWeight: 600 }}>
                        {member.sNo}
                      </td>
                      <td style={{ color: "#333" }}>
                        {member.name}
                      </td>
                      <td style={{ color: "#666" }}>
                        {member.designation}
                      </td>
                      <td>
                        {member.role === "Chairperson" || member.role === "Coordinator" ? (
                          <span style={{
                            background: "#2B3490",
                            color: "#D4A500",
                            fontSize: 11,
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontWeight: 700,
                          }}>
                            {member.role}
                          </span>
                        ) : (
                          member.role
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 5 — MINUTES & AGENDA */}
      <section id="minutes" style={{ padding: "80px 0", background: "white" }}>
        <Container>
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h2 style={{
              fontSize: "clamp(2rem, 3vw, 2.6rem)",
              fontWeight: 800,
              fontFamily: "'Rajdhani', sans-serif",
              color: "#2B3490",
              marginBottom: 40,
              textAlign: "center",
            }}>
              Minutes of Meeting
            </h2>

            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              {minutes.map((item) => (
                <div key={item.year} style={{ marginBottom: 8 }}>
                  <button
                    onClick={() => setOpenYear(openYear === item.year ? null : item.year)}
                    style={{
                      background: "#f4f3ef",
                      padding: "16px 20px",
                      width: "100%",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "#2B3490",
                      fontSize: 16,
                      cursor: "pointer",
                      border: "none",
                      borderBottom: "1px solid #e5e7eb",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    {item.year}
                    <span style={{ fontSize: 12 }}>
                      {openYear === item.year ? "▲" : "▼"}
                    </span>
                  </button>

                  {openYear === item.year && (
                    <div style={{ background: "white", borderBottom: "1px solid #e5e7eb" }}>
                      {item.dates.map((date) => (
                        <a
                          key={date}
                          href={`https://ksrmce.ac.in/IQAC/MM/${date}.pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "flex",
                            gap: 8,
                            padding: "12px 20px",
                            color: "#2B3490",
                            textDecoration: "none",
                            fontSize: 14,
                            fontWeight: 500,
                            borderBottom: "1px solid #f5f5f5",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                        >
                          <span>📄</span>
                          <span>{date}</span>
                          <span style={{ marginLeft: "auto" }}>Download PDF →</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 6 — AQAR REPORTS */}
      <section id="aqar" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h2 style={{
              fontSize: "clamp(2rem, 3vw, 2.6rem)",
              fontWeight: 800,
              fontFamily: "'Rajdhani', sans-serif",
              color: "#2B3490",
              marginBottom: 40,
              textAlign: "center",
            }}>
              AQAR Reports
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}>
              {aqarReports.map((report) => (
                <a
                  key={report.year}
                  href={report.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 16px rgba(43,52,144,0.1)"
                    ;(e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"
                    ;(e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"
                  }}
                >
                  <div style={{
                    background: "#eef1ff",
                    width: 44,
                    height: 44,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}>
                    📊
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#2B3490", fontSize: 14, marginBottom: 4 }}>
                      AQAR Report {report.year}
                    </div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      Annual Quality Assurance Report
                    </div>
                  </div>
                  <div style={{ fontSize: 18, color: "#D4A500" }}>⬇</div>
                </a>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 7 — STUDENT SATISFACTION SURVEY */}
      <section id="survey" style={{ padding: "80px 0", background: "white" }}>
        <Container>
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h2 style={{
              fontSize: "clamp(2rem, 3vw, 2.6rem)",
              fontWeight: 800,
              fontFamily: "'Rajdhani', sans-serif",
              color: "#2B3490",
              marginBottom: 40,
              textAlign: "center",
            }}>
              Student Satisfaction Survey
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
              marginBottom: 48,
            }}>
              {surveys.map((survey) => (
                <a
                  key={survey.year}
                  href={survey.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    padding: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 16px rgba(43,52,144,0.1)"
                    ;(e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"
                    ;(e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"
                  }}
                >
                  <div style={{
                    background: "#eef1ff",
                    width: 44,
                    height: 44,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flexShrink: 0,
                  }}>
                    📝
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "#2B3490", fontSize: 14, marginBottom: 4 }}>
                      Survey {survey.year}
                    </div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      Student Satisfaction Report
                    </div>
                  </div>
                  <div style={{ fontSize: 18, color: "#D4A500" }}>⬇</div>
                </a>
              ))}
            </div>

            <h3 style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#2B3490",
              marginBottom: 20,
              textAlign: "center",
            }}>
              Feedback Forms
            </h3>

            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
            }}>
              {feedbackForms.map((form) => (
                <a
                  key={form.label}
                  href={form.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "#2B3490",
                    color: "white",
                    padding: "10px 20px",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    display: "inline-block",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#1a1d4d"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#2B3490"
                  }}
                >
                  {form.label}
                </a>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 8 — APEX BODIES */}
      <section id="apex" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <Container>
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h2 style={{
              fontSize: "clamp(2rem, 3vw, 2.6rem)",
              fontWeight: 800,
              fontFamily: "'Rajdhani', sans-serif",
              color: "#2B3490",
              marginBottom: 40,
              textAlign: "center",
            }}>
              Apex Bodies
            </h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}>
              {apexBodies.map((body) => (
                <a
                  key={body.name}
                  href={body.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "white",
                    borderRadius: 12,
                    padding: 40,
                    textAlign: "center",
                    border: "1px solid #e5e7eb",
                    textDecoration: "none",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 32px rgba(43,52,144,0.15)"
                    ;(e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px)"
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"
                    ;(e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16, display: "block" }}>
                    {body.icon}
                  </div>
                  <div style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#2B3490",
                    marginBottom: 20,
                  }}>
                    {body.name}
                  </div>
                  <div style={{
                    background: "#2B3490",
                    color: "#D4A500",
                    padding: "12px 28px",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: 14,
                    display: "inline-block",
                  }}>
                    View Details →
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* SECTION 9 — CONTACT */}
      <section id="contact" style={{ padding: "80px 0", background: "white" }}>
        <Container>
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h2 style={{
              fontSize: "clamp(2rem, 3vw, 2.6rem)",
              fontWeight: 800,
              fontFamily: "'Rajdhani', sans-serif",
              color: "#2B3490",
              marginBottom: 40,
              textAlign: "center",
            }}>
              Contact IQAC
            </h2>

            <div style={{
              maxWidth: 600,
              margin: "0 auto",
              border: "2px solid #D4A500",
              borderRadius: 12,
              padding: 40,
            }}>
              <div style={{
                fontWeight: 700,
                fontSize: 20,
                color: "#2B3490",
                marginBottom: 8,
              }}>
                Internal Quality Assurance Cell (IQAC)
              </div>
              <div style={{
                fontSize: 15,
                color: "#666",
                marginBottom: 32,
              }}>
                K.S.R.M. College of Engineering (Autonomous)
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: "📧", label: "dean.iqac@ksrmce.ac.in", href: "mailto:dean.iqac@ksrmce.ac.in" },
                  { icon: "📧", label: "iqac@ksrmce.ac.in", href: "mailto:iqac@ksrmce.ac.in" },
                  { icon: "📞", label: "+91 8499918303", href: "tel:+918499918303" },
                  { icon: "📞", label: "+91 8985717578", href: "tel:+918985717578" },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    style={{
                      display: "flex",
                      gap: 12,
                      padding: "10px 16px",
                      background: "rgba(255,230,25,0.1)",
                      borderRadius: 4,
                      color: "#2B3490",
                      fontWeight: 600,
                      fontSize: 14,
                      textDecoration: "none",
                      marginBottom: 8,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,230,25,0.2)"
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,230,25,0.1)"
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  )
}
