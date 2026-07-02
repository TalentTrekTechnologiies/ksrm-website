"use client";

import { useState } from "react";

type FacultyMember = {
  name: string;
  designation: string;
  qualification: string;
  specialization?: string;
  photo?: string;
};

const facultyByDept: Record<string, FacultyMember[]> = {
  "Computer Science & Engineering": [
    { name: "Dr. V. Lokeswara Reddy", designation: "Professor & Head", qualification: "M.Tech., Ph.D.", specialization: "Software Engineering" },
    { name: "Dr. N. Amaranatha Reddy", designation: "Professor", qualification: "M.Tech., Ph.D.", specialization: "Data Science" },
    { name: "Dr. G. Sreenivasa Reddy", designation: "Professor", qualification: "M.Tech., Ph.D.", specialization: "Artificial Intelligence" },
    { name: "Dr. V. Giridhar", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", specialization: "Web Technologies" },
    { name: "Dr. T. Kiran Kumar", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", specialization: "Database Systems" },
    { name: "Dr. V. Ramesh Babu", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", specialization: "Cloud Computing" },
  ],
  "Electrical & Electronics Engineering": [
    { name: "Department Head", designation: "Professor & Head", qualification: "M.Tech., Ph.D.", specialization: "Power Systems" },
  ],
  "Electronics & Communication Engineering": [
    { name: "Dr. P. Lokeswar Reddy", designation: "Professor & Head", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.-p.-lokeswar-reddy.jpg", specialization: "VLSI Design" },
    { name: "Dr. P. Giri Prasad", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.-p.-giri-prasad.jpg", specialization: "Signal Processing" },
    { name: "Dr. S. Zahiruddin", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.s.-zahiruddin.jpg", specialization: "Microwave Engineering" },
    { name: "Dr. M. Madhusudhan Reddy", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.-m.-madhusudhan-reddy.jpg", specialization: "Communication Systems" },
    { name: "Dr. G. Hemalatha", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.-g.-hemalatha.jpg", specialization: "Digital Signal Processing" },
    { name: "Dr. D. Arun Kumar", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.-d.-arun-kumar.jpg", specialization: "Microelectronics" },
    { name: "Dr. S. L. Prathapa Reddy", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/ece/dr.s.l.-prathapa-reddy.jpg", specialization: "Embedded Systems" },
    { name: "G. A. Sanjeeva Reddy", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/faculty/ece/g.a.-sanjeeva-reddy.jpg", specialization: "RF & Microwave" },
    { name: "P. Krishna Teja Yadav", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/faculty/ece/p.-krishna-teja-yadav.jpg", specialization: "Communications" },
    { name: "M. Prabhakar", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/faculty/ece/m.-prabhakar.jpg", specialization: "Analog Electronics" },
  ],
  "Civil Engineering": [
    { name: "Dr. G. Chennakesava Reddy", designation: "Professor & Head", qualification: "M.Tech., Ph.D.", specialization: "Structural Engineering" },
    { name: "Dr. N. Amaranatha Reddy", designation: "Professor", qualification: "M.Tech., Ph.D.", specialization: "Geotechnical Engineering" },
    { name: "Dr. V. Giridhar", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", specialization: "Transportation Engineering" },
    { name: "Dr. M.V. Ravi Kishore Reddy", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/civil/m-v-ravi-k-reddy.jpg", specialization: "Structural Design" },
    { name: "Dr. I. Srinivasula Reddy", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/civil/isr.jpg", specialization: "Environmental Engineering" },
    { name: "Sri. P. Suresh Praveen Kumar", designation: "Assistant Professor", qualification: "M.Tech.", specialization: "Water Resources" },
    { name: "Smt. K. Niveditha", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/faculty/civil/niveditha.jpg", specialization: "Concrete Technology" },
    { name: "Sri. P. Rajendra Kumar", designation: "Assistant Professor", qualification: "M.Tech.", specialization: "Surveying" },
    { name: "Sri. Y. Dastagiri", designation: "Assistant Professor", qualification: "M.Tech.", specialization: "Construction Management" },
    { name: "Smt. V. Venkata Subbamma", designation: "Assistant Professor", qualification: "M.Tech.", specialization: "Geotechnical Engineering" },
    { name: "Sri. K. Hemanth Kumar Reddy", designation: "Assistant Professor", qualification: "M.Tech.", specialization: "Transportation Engineering" },
    { name: "Sri. D. Viswanath", designation: "Assistant Professor", qualification: "M.Tech.", specialization: "Hydraulic Engineering" },
    { name: "Sri. M. Vijaya Kumar", designation: "Assistant Professor", qualification: "M.Tech.", specialization: "Structural Analysis" },
  ],
  "Mechanical Engineering": [
    { name: "Dr. Mahaboob Basha", designation: "Professor & Head", qualification: "M.Tech., Ph.D.", photo: "/faculty/mechanical/mahaboob-basha.mec.jpeg", specialization: "Thermal Engineering" },
    { name: "Dr. Ravichandra", designation: "Professor", qualification: "M.Tech., Ph.D.", photo: "/faculty/mechanical/ravichandra.jpg", specialization: "Machine Design" },
    { name: "S. Vijay Kumar", designation: "Associate Professor", qualification: "M.Tech.", photo: "/faculty/mechanical/s-vijay-kumar.jpg", specialization: "Fluid Mechanics" },
    { name: "Gowthami", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/faculty/mechanical/gowthami.jpg", specialization: "Manufacturing Engineering" },
    { name: "D. Merwin Rajesh", designation: "Assistant Professor", qualification: "M.Tech.", photo: "/faculty/mechanical/d.merwin-rajesh.png", specialization: "Thermodynamics" },
  ],
  "Humanities & Sciences": [
    { name: "Dr. Mathematics Department Head", designation: "Professor & Head", qualification: "M.Tech., Ph.D.", specialization: "Mathematics" },
    { name: "Dr. Physics Faculty", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", specialization: "Physics" },
    { name: "Dr. Chemistry Faculty", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", specialization: "Chemistry" },
    { name: "Dr. English Faculty", designation: "Assistant Professor", qualification: "M.Tech.", specialization: "English" },
  ],
  "Management Studies (MBA)": [
    { name: "Dr. MBA Department Head", designation: "Professor & Head", qualification: "M.Tech., Ph.D.", specialization: "Management Studies" },
    { name: "Dr. Finance & Accounting", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", specialization: "Finance" },
    { name: "Dr. Operations Management", designation: "Associate Professor", qualification: "M.Tech., Ph.D.", specialization: "Operations" },
    { name: "Dr. Human Resources", designation: "Assistant Professor", qualification: "M.Tech.", specialization: "HR Management" },
  ],
};

const TABS = Object.keys(facultyByDept);

function initials(name: string) {
  return name.replace(/^(Dr\.|Sri\.|Smt\.)\s*/, "").split(" ").map((w) => w[0]).join("").toUpperCase();
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4A500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <path d="M16 3.128a4 4 0 0 1 0 7.744" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  );
}
function AwardIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4A500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" />
      <circle cx="12" cy="8" r="6" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4A500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

export default function FacultyPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const members = facultyByDept[activeTab];

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

        .fac-hero {
          position: relative; background-image: url('/gallery/Gallery _ KSRM College of Engineering_files/faculty2.jpg');
          background-size: cover; background-position: center;
          background-color: #2B3490; min-height: 320px; display: flex;
          align-items: flex-end; overflow: hidden; padding-bottom: 40px;
        }
        .fac-hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%);
          z-index: 0;
        }
        .fac-hero > * {
          position: relative;
          z-index: 1;
        }
        .fac-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 2px;
          text-transform: uppercase; color: #D4A500;
        }
        .fac-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(255,255,255,0.7); margin-top: 24px; }
        .fac-breadcrumb a { color: #D4A500; text-decoration: none; }
        .fac-breadcrumb span { color: #D4A500; }

        .fac-stats-bar {
          background: #2B3490; padding: 32px 0; display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 32px;
        }
        .fac-stat-item { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
        .fac-stat-icon { width: 48px; height: 48px; background: rgba(255,230,25,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .fac-stat-number { font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; color: #D4A500; }
        .fac-stat-label { font-size: 13px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px; }

        .fac-tabs { display: flex; gap: 8px; padding: 40px 0; overflow-x: auto; scrollbar-width: none; margin-bottom: 40px; }
        .fac-tabs::-webkit-scrollbar { display: none; }
        .fac-tab {
          padding: 10px 18px; border-radius: 24px; font-size: 14px; font-weight: 600;
          font-family: 'Rajdhani', sans-serif; border: 1.5px solid #eef0f3; background: #fff;
          color: #555; cursor: pointer; transition: all 0.2s; white-space: nowrap; flex-shrink: 0;
        }
        .fac-tab.active { background: #2B3490; color: #fff; border-color: #2B3490; }
        .fac-tab:hover { border-color: #2B3490; }

        .fac-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 40px; }
        .fac-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; overflow: hidden; transition: all 0.2s; }
        .fac-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(43,52,144,0.12); }
        .fac-photo { width: 100%; aspect-ratio: 1/1; background: linear-gradient(135deg, #2B3490, #1e2570); display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .fac-photo img { width: 100%; height: 100%; object-fit: cover; }
        .fac-info { padding: 20px; }
        .fac-name { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
        .fac-designation { color: #2B3490; font-size: 12px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px; }
        .fac-meta { font-size: 13px; color: #666; margin: 0 0 12px; display: flex; flex-direction: column; gap: 4px; }
        .fac-meta strong { color: #2B3490; }
        .fac-specialization { display: inline-block; background: #eef1ff; color: #2B3490; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; font-family: 'Rajdhani', sans-serif; }

        @media (max-width: 1200px) { .fac-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
          .fac-grid { grid-template-columns: 1fr; }
          .fac-stats-bar { grid-template-columns: repeat(2, 1fr); gap: 24px; padding: 24px 0; }
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        <section className="fac-hero" style={{ backgroundImage: "url('/images/campus/13.jpg')", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(43, 52, 144, 0.85)" }} />
          <div className="responsive-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ padding: "72px 0" }}>
              <div className="fac-eyebrow" style={{ marginBottom: 16 }}>Academics</div>
              <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>Faculty</h1>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 300, maxWidth: 700 }}>Meet Our Experienced Educators</p>
              <div className="fac-breadcrumb">
                <a href="/">Home</a><span>/</span><a href="/academics">Academics</a><span>/</span><span>Faculty</span>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
          <div className="responsive-container">
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0, maxWidth: 820 }}>
              KSRM College of Engineering is served by a dedicated team of experienced faculty members with strong
              academic credentials and industry exposure. Our faculty are committed to imparting quality education,
              conducting research, and mentoring the next generation of engineers.
            </p>
          </div>
        </section>

        <section style={{ padding: "40px 0", background: "#2B3490" }}>
          <div className="responsive-container">
            <div className="fac-stats-bar">
              <div className="fac-stat-item">
                <div className="fac-stat-icon"><UsersIcon /></div>
                <div className="fac-stat-number">88</div>
                <div className="fac-stat-label">Total Faculty</div>
              </div>
              <div className="fac-stat-item">
                <div className="fac-stat-icon"><AwardIcon /></div>
                <div className="fac-stat-number">26</div>
                <div className="fac-stat-label">PhD Holders</div>
              </div>
              <div className="fac-stat-item">
                <div className="fac-stat-icon"><BriefcaseIcon /></div>
                <div className="fac-stat-number">12+ Years</div>
                <div className="fac-stat-label">Avg. Experience</div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
              Our Faculty by Department
            </h2>
            <div className="fac-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={`fac-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {members.length === 0 ? (
              <p style={{ color: "#666", fontSize: 14 }}>Faculty data for this department has not been added yet.</p>
            ) : (
              <div className="fac-grid">
                {members.map((m) => (
                  <div className="fac-card" key={m.name}>
                    <div className="fac-photo">
                      {m.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.photo} alt={m.name} />
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 32, fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>
                          {initials(m.name)}
                        </span>
                      )}
                    </div>
                    <div className="fac-info">
                      <h3 className="fac-name">{m.name}</h3>
                      <div className="fac-designation">{m.designation}</div>
                      <div className="fac-meta">
                        <div><strong>Qualification:</strong> {m.qualification}</div>
                      </div>
                      {m.specialization && <div className="fac-specialization">{m.specialization}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
