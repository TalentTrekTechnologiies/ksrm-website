import PageResources from "@/components/PageResources";
const stats = [
  { icon: "📖", value: "45,000+", label: "Books" },
  { icon: "📚", value: "150+", label: "Journals" },
  { icon: "🖥️", value: "25+", label: "E-Resources" },
  { icon: "🔖", value: "500+", label: "Seating" },
];

const sections = [
  { title: "Reference Section", desc: "Houses encyclopedias, dictionaries, handbooks, standards, and reference materials for quick consultation. Non-circulating collection available for in-library use." },
  { title: "Periodicals Section", desc: "Comprehensive collection of national and international journals, magazines, and newspapers covering all disciplines. Both print and digital subscriptions available." },
  { title: "Digital Resources", desc: "Access to e-books, online journals, research databases, and digital archives. OPAC system for easy search and retrieval of library materials." },
  { title: "Lending Section", desc: "Circulating collection of books available for home borrowing. Self-checkout system and easy renewal options for member convenience." },
];

const eresources = [
  { title: "NPTEL (National Programme on Technology Enhanced Learning)", desc: "Free online courses and video lectures in engineering, science, and humanities from IIT and IISC faculty.", href: "https://nptel.ac.in" },
  { title: "IEEE Xplore", desc: "Access to IEEE transactions, conferences, and standards in electrical engineering and computer science.", href: "#" },
  { title: "Springer Link", desc: "Digital library with access to journals, e-books, and research articles across all disciplines.", href: "#" },
  { title: "JSTOR", desc: "Comprehensive archive of academic journals, books, and primary sources in humanities, social sciences, and sciences.", href: "#" },
  { title: "ProQuest Dissertations & Theses", desc: "Global collection of dissertations and theses from universities worldwide for research reference.", href: "#" },
];

const rules = [
  "All students, faculty, and staff are eligible library members with a valid identity card.",
  "Library hours: Monday-Friday 8:00 AM - 8:00 PM, Saturday 9:00 AM - 5:00 PM, Closed on Sundays and public holidays.",
  "Maximum borrowing limit: 4 books per member for 14 days.",
  "Overdue fine: ₹5 per book per day (maximum ₹50 per book).",
  "Lost or damaged books must be replaced or full amount paid.",
  "Silence is mandatory in the library. Mobile phones must be on silent mode.",
  "Food and beverages are strictly prohibited inside the library.",
  "Reservation of books is allowed up to 7 days in advance.",
  "Photocopying and printing facilities available at nominal charges.",
  "Members must return all borrowed materials before graduation or termination of course.",
];

export default function LibraryPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .lib-hero { position: relative; background-image: url('/banners/library.png'); background-size: cover; background-position: center; background-color: #2B3490; min-height: 320px; display: flex; align-items: flex-end; overflow: hidden; padding-bottom: 40px; }
        .lib-hero::before { content: ''; position: absolute; inset: 0; background-color: rgba(43,52,144,0.85); }
        .lib-hero > * { position: relative; z-index: 2; }
        .lib-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #D4A500; }
        .lib-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-top: 24px; }
        .lib-breadcrumb a { color: #D4A500; text-decoration: none; }
        .lib-breadcrumb span { color: #D4A500; }
        .lib-stats-bar { background: #2B3490; padding: 32px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 32px; }
        .lib-stat-item { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
        .lib-stat-icon { width: 48px; height: 48px; background: rgba(255,230,25,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .lib-stat-number { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; color: #D4A500; }
        .lib-stat-label { font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px; }
        .lib-section-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 40px; }
        .lib-section-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 28px; display: flex; flex-direction: column; gap: 16px; }
        .lib-section-icon { width: 48px; height: 48px; background: #eef1ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .lib-section-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #1a1a2e; margin: 0; }
        .lib-section-card p { color: #555; font-size: 15px; line-height: 1.6; margin: 0; }
        .lib-eresources-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 40px; }
        .lib-eresource-card { background: #f4f3ef; border: 1px solid #eef0f3; border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .lib-eresource-card h4 { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: #2B3490; margin: 0; }
        .lib-eresource-card p { color: #555; font-size: 14px; line-height: 1.6; margin: 0; }
        .lib-eresource-link { display: inline-flex; align-items: center; gap: 6px; color: #2B3490; font-size: 13px; font-weight: 700; text-decoration: none; width: fit-content; }
        .lib-rules { margin-top: 40px; display: flex; flex-direction: column; gap: 12px; }
        .lib-rule { background: #fff; border-left: 4px solid #2B3490; padding: 16px 20px; border-radius: 4px; font-size: 15px; color: #555; line-height: 1.6; }
        .lib-contact-card { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); border-radius: 12px; padding: 40px; color: #fff; margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .lib-contact-item { display: flex; flex-direction: column; gap: 12px; }
        .lib-contact-item-icon { width: 48px; height: 48px; background: rgba(255,230,25,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; width: fit-content; }
        .lib-contact-item h4 { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #D4A500; margin: 0; }
        .lib-contact-item p { font-size: 16px; margin: 0; line-height: 1.6; }
        .lib-contact-item a { color: #D4A500; text-decoration: none; }
        .lib-contact-librarian { border-right: 1px solid rgba(255,230,25,0.2); }
        @media (max-width: 900px) {
          .lib-contact-card { grid-template-columns: 1fr; gap: 32px; }
          .lib-contact-librarian { border-right: none; border-bottom: 1px solid rgba(255,230,25,0.2); padding-bottom: 32px; }
        }
      `}</style>

      <section className="lib-hero">
        <div className="responsive-container">
          <div className="lib-eyebrow" style={{ marginBottom: 16 }}>Campus Life</div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>Library</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 700 }}>Knowledge Hub of the Campus</p>
        </div>
      </section>

      <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <div style={{ maxWidth: 820 }}>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0 }}>
              The Central Library of KSRM College of Engineering is a state-of-the-art facility designed to support
              academic excellence and research. With an extensive collection of books, journals, and digital
              resources, our library serves as the knowledge hub of the campus. Our dedicated staff is committed to
              providing excellent service and fostering a conducive learning environment.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", margin: "0 0 40px" }}>Library Tour</h2>
          <div style={{ borderRadius: 8, overflow: "hidden", maxWidth: 1000, margin: "0 auto" }}>
            <video autoPlay loop muted playsInline style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }}>
              <source src="/videos/central-library.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </section>

      <section style={{ padding: "40px 0", background: "#2B3490" }}>
        <div className="responsive-container">
          <div className="lib-stats-bar">
            {stats.map((s) => (
              <div className="lib-stat-item" key={s.label}>
                <div className="lib-stat-icon">{s.icon}</div>
                <div className="lib-stat-number">{s.value}</div>
                <div className="lib-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}>Library Sections</h2>
          <div className="lib-section-grid">
            {sections.map((s) => (
              <div className="lib-section-card" key={s.title}>
                <div className="lib-section-icon">📖</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}>Digital Resources &amp; E-Resources</h2>
          <div className="lib-eresources-grid">
            {eresources.map((e) => (
              <div className="lib-eresource-card" key={e.title}>
                <h4>{e.title}</h4>
                <p>{e.desc}</p>
                <a href={e.href} className="lib-eresource-link" target="_blank" rel="noopener noreferrer">Access Resource →</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}>Library Rules &amp; Regulations</h2>
          <div className="lib-rules">
            {rules.map((r, i) => (
              <div className="lib-rule" key={r}><strong>{i + 1}.</strong> {r}</div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <div className="lib-contact-card">
            <div className="lib-contact-librarian">
              <div className="lib-contact-item">
                <div className="lib-contact-item-icon">📖</div>
                <h4>Librarian (Dr. [Name])</h4>
                <p style={{ fontSize: 15, marginTop: 8 }}>Head of the Central Library with 20+ years of experience in library management and digital resource curation.</p>
              </div>
            </div>
            <div>
              <div className="lib-contact-item">
                <div className="lib-contact-item-icon">📞</div>
                <h4>Phone</h4>
                <p><a href="tel:+91-8554-233333 (Ext: 250)">+91-8554-233333 (Ext: 250)</a></p>
              </div>
              <div className="lib-contact-item" style={{ marginTop: 24 }}>
                <div className="lib-contact-item-icon">✉️</div>
                <h4>Email</h4>
                <p><a href="mailto:library@ksrmce.ac.in">library@ksrmce.ac.in</a></p>
              </div>
              <div className="lib-contact-item" style={{ marginTop: 24 }}>
                <div className="lib-contact-item-icon">🕐</div>
                <h4>Timings</h4>
                <p>Monday-Friday: 8:00 AM - 8:00 PM | Saturday: 9:00 AM - 5:00 PM | Closed: Sundays &amp; Public Holidays</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PageResources section="library" />
    </main>
  );
}

