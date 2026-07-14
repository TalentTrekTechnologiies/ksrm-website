"use client";

import PageResources from "@/components/PageResources";

const missions = [
  "Create a conducive environment for quality research and innovation",
  "Promote industry-academia collaboration and knowledge transfer",
  "Facilitate resource mobilization for research and development",
  "Ensure ethical research practices and compliance with integrity standards",
  "Support research scholars and supervisors in achieving excellence",
];

const committee = [
  { name: "Sri K. Madan Mohan Reddy", designation: "Vice Chairman", dept: "Administration" },
  { name: "Dr. K. Chandra Obul Reddy", designation: "Managing Director", dept: "Administration" },
  { name: "Dr. T. Nageswara Prasad", designation: "Principal", dept: "Academic Administration" },
  { name: "Dr. M. Venkatanarayana", designation: "Professor, ECE & Dean, R&D Cell", dept: "Electronics & Communication Engineering" },
  { name: "Sri A. Ramprakash Reddy", designation: "Head of Department", dept: "Computer Science & Engineering" },
  { name: "Dr. B. Bhaskar Reddy", designation: "Head of Department", dept: "Electronics & Communication Engineering" },
  { name: "Dr. G. Chennakesava Reddy", designation: "Head of Department", dept: "Civil Engineering" },
  { name: "Dr. M. S. Priyadarshini", designation: "Head of Department", dept: "Electrical & Electronics Engineering" },
  { name: "Dr. D. Ravikanth", designation: "Head of Department", dept: "Mechanical Engineering" },
];

const policies = [
  { icon: "📋", name: "RDC Policy", desc: "Overall research and development cell policies and procedures", file: "/documents/research/RDC-Policy.pdf" },
  { icon: "🔬", name: "Research Promotion Policy", desc: "Policy for promoting research activities among faculty and students", file: "/documents/research/Research-Promotion-Policy.pdf" },
  { icon: "💰", name: "Seed Fund Policy", desc: "Guidelines for seed funding schemes to support research initiation", file: "/documents/research/Seed-Funding-Scheme-Policy.pdf" },
  { icon: "⚖️", name: "Code of Ethics for Research", desc: "Ethical guidelines for research conduct, plagiarism prevention, and integrity", file: "/documents/research/Code-of-Ethics-Research-Innovation.pdf" },
  { icon: "🚀", name: "Startup & Innovation Policy", desc: "Policy framework for startup development and innovation initiatives", file: "/documents/research/Startup-Policy-KSRM-BICF.doc" },
  { icon: "🔐", name: "Intellectual Property Rights (IPR) Policy", desc: "Guidelines for intellectual property protection and management", file: "/documents/research/IPR-Policy.pdf" },
  { icon: "🤝", name: "Consultancy Policy", desc: "Framework for faculty and institutional consultancy projects", file: "/documents/research/Consultancy-Policy.pdf" },
];

const additionalDocs = [
  { name: "RDC Policy Framework", file: "/documents/research/RDC-Policy.pdf" },
  { name: "Research & Development Cell Guidelines", file: "/documents/research/Research%20and%20Development%20Cell%20(1).pdf" },
  { name: "Seed Funding Scheme", file: "/documents/research/Seed%20Funding%20Scheme%20Policy%20(1)%20(1).pdf" },
  { name: "Co-Working Agreement", file: "/documents/research/Co-Working_Agreement_KSRM-BICF.docx" },
];

const tabs = [
  { label: "📖 About RDC", id: "about" },
  { label: "🎯 Vision & Mission", id: "vision" },
  { label: "👥 Advisory Committee", id: "committee" },
  { label: "📋 Policies & Guidelines", id: "policies" },
  { label: "📞 Contact", id: "contact" },
];

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V3" /><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B3490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#D4A500" }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><path d="M16 3.128a4 4 0 0 1 0 7.744" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><circle cx="9" cy="7" r="4" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#D4A500" }}>
      <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#D4A500" }}>
      <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" />
    </svg>
  );
}

export default function ResearchPage() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div>
      <style>{`
        .rdc-hero-btn {
          padding: 10px 20px; border: none; border-radius: 8px; background: #2B3490;
          color: #D4A500; font-weight: 600; cursor: pointer; white-space: nowrap;
          transition: all 0.3s; font-size: 14px;
        }
        .rdc-hero-btn:hover { background: #1e2570; }
        .rdc-policy-card { background: linear-gradient(135deg, #2B3490 0%, #1a1d4d 100%); border-radius: 8px; padding: 24px; color: #fff; display: flex; flex-direction: column; gap: 12px; transition: all 0.3s; }
        .rdc-policy-card:hover { transform: translateY(-4px); }
        .rdc-policy-link {
          margin-top: auto; display: flex; align-items: center; gap: 8px; color: #D4A500;
          text-decoration: none; font-weight: 600; font-size: 13px; padding: 8px 12px;
          border-radius: 4px; background: rgba(255,230,25,0.1);
        }
        .rdc-committee-card {
          background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; padding: 20px;
          text-align: center; position: relative;
        }
        .rdc-doc-link {
          display: flex; align-items: center; gap: 12px; padding: 16px; background: #fff;
          border: 1px solid #ddd; border-radius: 8px; text-decoration: none; color: #2B3490;
        }
        .rdc-contact-link {
          display: flex; align-items: center; gap: 12px; justify-content: center; color: #2B3490;
          text-decoration: none; font-weight: 600; font-size: 14px; padding: 8px 12px;
          background: rgba(255,230,25,0.1); border-radius: 4px;
        }
      `}</style>

      {/* HERO */}
      <section
        style={{
          backgroundImage: "url('/banners/research.png')", backgroundSize: "cover", backgroundPosition: "center",
          backgroundColor: "#2B3490", padding: "80px 0", color: "#fff", position: "relative", overflow: "hidden",
          minHeight: 320, display: "flex", alignItems: "flex-end",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: 14, letterSpacing: 2, textTransform: "uppercase", color: "#D4A500", fontWeight: 600, margin: "0 0 8px" }}>
            🔬 Research Excellence
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 700, margin: "0 0 16px", fontFamily: "'Rajdhani', sans-serif" }}>
            Research &amp; Development Cell (RDC)
          </h1>
          <p style={{ fontSize: 18, color: "#D4A500", fontWeight: 600, margin: "0 0 24px" }}>
            Advancing Knowledge Through Research &amp; Innovation
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "#e0e0e0", margin: 0, maxWidth: 600 }}>
            The Research and Development Cell (RDC) of KSRMCE is committed to building a robust research ecosystem
            that fosters innovation, industry-academia collaboration, and ethical research practices among faculty
            and students.
          </p>
        </div>
      </section>

      {/* STICKY TAB BAR */}
      <section style={{ padding: "40px 0", background: "#f4f3ef", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
            {tabs.map((t) => (
              <button key={t.id} className="rdc-hero-btn" onClick={() => scrollTo(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }} id="about">
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 32px" }}>
            About the Research &amp; Development Cell
          </h2>
          <div style={{ background: "#f9f9f9", borderLeft: "4px solid #D4A500", borderRadius: 8, padding: 28, fontSize: 16, lineHeight: 1.9, color: "#444" }}>
            <p style={{ margin: "0 0 16px" }}>
              The Research and Development Cell (RDC) of KSRMCE facilitates and encourages the research culture
              among faculty and students. The establishment of the R&amp;D Cell is to develop and strengthen the
              research environment in the departments and to align it with the educational policies of India. The
              RDC provides a favorable environment for productive research, industrial and institutional
              collaborations, and mobilizes resources and grants. The college follows the research mandate by
              various National Missions, SDGs, and the Start-up India initiative leading to a Self-Reliant India
              (Atma-Nirbhar Bharat).
            </p>
            <p style={{ margin: "0 0 16px" }}>
              RDC encourages faculty to conceive ideas through enhanced industry-academia interactions and prepare
              research proposals for funding from various agencies. It organizes events like capacity-building
              programs and research theme-based workshops and internships that motivate students, scholars, and
              faculty to participate actively in ideation and innovative research in emerging areas.
            </p>
            <p style={{ margin: 0 }}>
              RDC ensures that researchers understand the importance of integrity and ethics, comply with ethical
              codes of research, and follow publishing practices at institutional, national, and global levels. All
              papers undergo standard plagiarism checks, and necessary software is made available for all researchers.
            </p>
          </div>
        </div>
      </section>

      {/* INNOVATION HEADING */}
      <section style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 40px" }}>
            🤖 Innovation &amp; Student Projects
          </h2>
        </div>
      </section>

      {/* CAMPUS INNOVATION VIDEO */}
      <section style={{ padding: "80px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 40px", textAlign: "center" }}>
            Campus Innovation Video
          </h2>
          <div style={{ borderRadius: 8, overflow: "hidden", maxWidth: 720, margin: "0 auto" }}>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video autoPlay loop muted playsInline style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }}>
              <source src="/videos/3d-robo.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      {/* Admin-uploaded research videos / images / documents */}
      <PageResources section="research" background="#ffffff" />

      {/* VISION & MISSION */}
      <section style={{ padding: "80px 0", background: "#f4f3ef", borderTop: "1px solid #e8e8e8" }} id="vision">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 32px" }}>
            Vision &amp; Mission
          </h2>
          <div style={{ background: "#fff", border: "2px solid #D4A500", borderRadius: 8, padding: 24, marginBottom: 48 }}>
            <h3 style={{ color: "#2B3490", fontWeight: 700, margin: "0 0 12px" }}>🎯 Vision</h3>
            <p style={{ fontSize: 15, color: "#555", lineHeight: 1.8, margin: 0 }}>
              To establish a robust mechanism for developing and strengthening the research ecosystem of the institution.
            </p>
          </div>
          <h3 style={{ color: "#2B3490", fontWeight: 700, margin: "0 0 20px", fontSize: 18 }}>🚀 Our Missions</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {missions.map((m, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 20 }}>
                <div style={{ fontSize: 12, color: "#2B3490", fontWeight: 700, marginBottom: 8 }}>MISSION {i + 1}</div>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0 }}>{m}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ADVISORY COMMITTEE */}
      <section style={{ padding: "80px 0", background: "#fff", borderTop: "1px solid #e8e8e8" }} id="committee">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 32px", display: "flex", alignItems: "center", gap: 12 }}>
            <UsersIcon />
            Advisory Committee
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
            {committee.map((c, i) => (
              <div className="rdc-committee-card" key={c.name}>
                <div style={{ position: "absolute", top: 12, right: 12, background: "#D4A500", color: "#2B3490", borderRadius: "50%", width: 24, height: 24, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: 12, color: "#D4A500", fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>COMMITTEE MEMBER</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#2B3490", margin: "0 0 8px" }}>{c.name}</h3>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px", fontWeight: 600 }}>{c.designation}</p>
                <p style={{ fontSize: 12, color: "#999", margin: 0 }}>{c.dept}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POLICIES */}
      <section style={{ padding: "80px 0", background: "#f4f3ef", borderTop: "1px solid #e8e8e8" }} id="policies">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 32px" }}>
            📋 Policies &amp; Guidelines
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
            {policies.map((p) => (
              <div className="rdc-policy-card" key={p.name}>
                <div style={{ fontSize: 28 }}>{p.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "#D4A500" }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: "#d0d0d0", lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
                <a href={p.file} download className="rdc-policy-link"><DownloadIcon />Download PDF</a>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 60 }}>
            <h3 style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 24px" }}>
              📥 Additional Resources &amp; Documents
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
              {additionalDocs.map((d) => (
                <a href={d.file} download className="rdc-doc-link" key={d.name}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, background: "#eef1ff", borderRadius: 6 }}>
                    <FileIcon />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{d.name}</p>
                    <p style={{ margin: "3px 0 0", fontSize: 11, color: "#999" }}>Download →</p>
                  </div>
                  <span style={{ color: "#D4A500" }}><DownloadIcon /></span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section style={{ padding: "80px 0", background: "#fff", borderTop: "1px solid #e8e8e8" }} id="contact">
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", fontFamily: "'Rajdhani', sans-serif", margin: "0 0 32px" }}>
            Contact RDC
          </h2>
          <div style={{ background: "#eef1ff", borderRadius: 8, padding: "16px 24px", marginBottom: 24, fontSize: 14, color: "#2B3490", fontWeight: 600, display: "inline-block" }}>
            📍 KSRM College of Engineering, Cuddapah – 516003, Andhra Pradesh
          </div>
          <div style={{ background: "#f9f9f9", border: "2px solid #D4A500", borderRadius: 8, padding: 32, maxWidth: 600, margin: "0 auto" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "0 0 8px" }}>Dr. M. Venkatanarayana</h3>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px", fontWeight: 600 }}>Dean, Research & Development Cell</p>
            <p style={{ fontSize: 12, color: "#999", margin: "0 0 20px" }}>Professor, Electronics & Communication Engineering</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="tel:+918554233333380" className="rdc-contact-link"><PhoneIcon />+91-8554-233333 (Ext: 380)</a>
              <a href="mailto:rdc@ksrmce.ac.in" className="rdc-contact-link"><MailIcon />rdc@ksrmce.ac.in</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
