import { mediaFile } from "@/lib/api-base";
﻿import PageResources from "@/components/PageResources";
const stats = [
  { value: "7,498+", label: "Alumni Members" },
  { value: "4", label: "Chapters (India + USA)" },
  { value: "40+", label: "Years of Association" },
  { value: "1985", label: "Year Founded" },
];

const activities = [
  "Provide a platform for alumni to communicate with the institution",
  "Promote registrations for Alumni directory",
  "Promote student interaction sessions and guest lectures",
  "Promote campus placements",
  "Promote contributions to help poor students",
  "Establish recreation centers, libraries and reading rooms for students",
  "Organize conferences, seminars, competitions and cultural shows",
  "Supply free books and materials to economically backward students",
];

const chapters = [
  { icon: "🏙️", city: "Chennai", contact: "G. Santhosh Kumar", addr: "Plot No.201, Street No.2, Shanti Residence, Vellachary, Chennai-600042", email: "happyguy@yahoo.co.in" },
  { icon: "🌆", city: "Bangalore", contact: "E. Giribabu", addr: "Plot No.523, AVR Complex, Indra Nagar, Bangalore-74", email: "giri_anand4@yahoo.co.in" },
  { icon: "🏛️", city: "Hyderabad", contact: "G. Rajesh Kumar", addr: "Plot No.516, Gokula Apartments, IX Phase, Hitech-City, Hyderabad-500072", email: "rajesh_reddy22@yahoo.co.in" },
  { icon: "🌎", city: "USA Chapter", contact: "International Chapter", addr: "United States of America", email: "alumni@ksrmce.ac.in" },
];

const meets = [
  { badge: "2022-23", label: "Alumni Meet 2022-23", href: mediaFile(175) },
  { badge: "2021-22", label: "Alumni Meet 2021-22", href: mediaFile(176) },
  { badge: "2019-20", label: "Alumni Meet 2019-20", href: mediaFile(177) },
  { badge: "2018-19", label: "Alumni Meet 2018-19", href: mediaFile(178) },
  { badge: "2017-18", label: "Alumni Meet 2017-18", href: mediaFile(179) },
  { badge: "2015-16 (Washington)", label: "Alumni Meet at Washington DC 2015-16", href: mediaFile(180) },
  { badge: "2015-16", label: "Alumni Meet 2015-16", href: mediaFile(181) },
  { badge: "2014-15", label: "Alumni Meet 2014-15", href: mediaFile(182) },
  { badge: "2013-14", label: "Alumni Meet 2013-14", href: mediaFile(186) },
  { badge: "2012-13", label: "Alumni Meet 2012-13", href: mediaFile(194) },
  { badge: "All Years", label: "Alumni Meets — Past 5 Years Combined", href: mediaFile(202) },
];

const contributions = [
  { period: "1985-89 batch, 2013", desc: "Laboratory development", amount: "₹50,000" },
  { period: "1986-90 batch, 2014", desc: "Library and placements development", amount: "₹1,00,000" },
  { period: "1985-89 batch, 2018", desc: "Cash awards for meritorious students", amount: "₹50,000" },
  { period: "1985-89 batch, 2019", desc: "Scholarships for meritorious students", amount: "₹75,000" },
  { period: "1988-92 batch, 2017", desc: "Laboratories, placements, digital library, campus surveillance", amount: "₹4,00,000" },
];

const activityReports = [
  { title: "Awareness Program on Industry Needs in Placements", href: mediaFile(205) },
  { title: "Organise Alumni Meet 2K22", href: mediaFile(206) },
  { title: "Program on Innovative Solution for Startups", href: mediaFile(207) },
  { title: "Guest Lecture on behalf of Alumni Association", href: mediaFile(208) },
  { title: "Organise World Water Day Celebrations", href: mediaFile(209) },
  { title: "Introduction to Solar PV Systems", href: mediaFile(210) },
  { title: "Webinar on Industrial Automation and Control", href: mediaFile(211) },
  { title: "Guest Lecture on Missile Guidance and Controls", href: mediaFile(212) },
  { title: "Webinar on Cloud Computing Primer", href: mediaFile(213) },
  { title: "Webinar on Trends in Information Technology", href: mediaFile(214) },
  { title: "Webinar on Power BI", href: mediaFile(215) },
  { title: "Balancing Research and Teaching", href: mediaFile(216) },
];

export default function AlumniPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }
        .alumni-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
        @media (max-width: 1024px) { .alumni-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .alumni-stats-grid { grid-template-columns: 1fr; gap: 16px; } }
        .alumni-vision-mission { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 32px; }
        @media (max-width: 768px) { .alumni-vision-mission { grid-template-columns: 1fr; gap: 20px; } }
        .alumni-chapters-grid, .alumni-meets-grid, .alumni-activity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
        .alumni-meets-grid, .alumni-activity-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .alumni-top-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; margin-bottom: 48px; }
      `}</style>

      <section style={{ backgroundImage: "url('/banners/alumni.png')", backgroundSize: "cover", backgroundPosition: "center", padding: "80px 0", color: "white", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.7) 100%)" }} />
        <div className="responsive-container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", background: "#D4A500", color: "#2B3490", padding: "8px 20px", borderRadius: 6, fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 20 }}>🎓 Alumni Association</div>
          <h1 style={{ fontSize: "clamp(2.2rem, 4vw, 3.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", margin: "0 0 8px" }}>KSRM Alumni Association</h1>
          <p style={{ fontSize: 20, fontWeight: 600, color: "#D4A500", margin: "0 0 16px" }}>Connecting 7,498+ Alumni Worldwide Since 1985</p>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 1.8, maxWidth: 700, margin: 0 }}>
            The Alumni Association was formed in December 1985. Registered under the Andhra Pradesh Societies Act 35
            of 2001, bearing Registration No.92/2004. With chapters in Hyderabad, Bangalore, Chennai and USA.
          </p>
        </div>
      </section>

      <section style={{ padding: "40px 0", background: "white" }}>
        <div className="responsive-container">
          <div className="alumni-stats-grid">
            {stats.map((s) => (
              <div key={s.label} style={{ textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: "#2B3490" }}>{s.value}</div>
                <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>About Alumni Association</h2>
          <div style={{ background: "white", borderLeft: "4px solid #D4A500", borderRadius: 8, padding: 28, marginBottom: 32 }}>
            <p style={{ fontSize: 15, lineHeight: 1.8, color: "#555", margin: 0 }}>
              The Alumni Association was formed in December, 1985 with Sri K.Sivananda Reddy as Chief Patron and the
              Principal as Patron. The association has grown in multifolds with duties and responsibilities shared by
              Chairman, Secretary, Joint Secretary, Treasurer and three member directors. The Association is
              registered under the Andhra Pradesh Societies Act 35 of 2001, bearing Registration No.92/2004.
            </p>
          </div>
          <div className="alumni-vision-mission">
            <div style={{ background: "white", border: "2px solid #D4A500", borderRadius: 8, padding: 28 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 16 }}>🎯 Vision</div>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "#555", margin: 0 }}>
                To connect and contact with all Alumni members in different parts of the world to create brotherhood
                among them and establish proper cooperation and coordination, so that everyone is benefited and to
                involve all Alumni members in the development of the Institute.
              </p>
            </div>
            <div style={{ background: "#2B3490", borderRadius: 8, padding: 28, color: "white" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#D4A500", marginBottom: 16 }}>🚀 Mission</div>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(255,255,255,0.9)", margin: 0 }}>
                To make every Alumni member upgrade technical skills and become professional engineers through
                interaction among all alumni members. And also to make use of the services of Alumni members to
                upgrade infrastructure facilities in the development of the institution.
              </p>
            </div>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#2B3490", marginBottom: 24 }}>Alumni Activities</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {activities.map((a) => (
              <div key={a} style={{ background: "white", borderRadius: 6, padding: 16, borderLeft: "4px solid #D4A500", fontSize: 14, color: "#444" }}>{a}</div>
            ))}
          </div>
        </div>
      </section>

      <section id="chapters" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Alumni Chapters</h2>
          <div className="alumni-chapters-grid">
            {chapters.map((c) => (
              <div key={c.city} style={{ background: "#f9f9f9", border: "1px solid #e5e7eb", borderRadius: 12, padding: 28, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{c.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#2B3490", marginBottom: 4 }}>{c.city}</div>
                <div style={{ fontSize: 14, color: "#666", fontWeight: 600, marginBottom: 8 }}>{c.contact}</div>
                <div style={{ fontSize: 13, color: "#999", lineHeight: 1.6, marginBottom: 12 }}>{c.addr}</div>
                <a href={`mailto:${c.email}`} style={{ fontSize: 13, color: "#2B3490", fontWeight: 600, textDecoration: "none" }}>{c.email}</a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="meets" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Alumni Meets</h2>
          <div className="alumni-meets-grid">
            {meets.map((m) => (
              <a key={m.label} href={m.href} target="_blank" rel="noopener noreferrer" style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20, display: "flex", alignItems: "center", gap: 16, textDecoration: "none" }}>
                <div style={{ background: "#eef1ff", width: 44, height: 44, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ background: "#2B3490", color: "#D4A500", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, display: "inline-block", marginBottom: 4 }}>{m.badge}</div>
                  <div style={{ color: "#2B3490", fontWeight: 500, fontSize: 14 }}>{m.label}</div>
                </div>
                <div style={{ color: "white", background: "#2B3490", padding: "4px 12px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>PDF →</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="contributions" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Alumni Contributions</h2>
          <div style={{ marginBottom: 32 }}>
            {contributions.map((c) => (
              <div key={c.period + c.desc} style={{ background: "#f9f9f9", borderRadius: 8, padding: 24, borderLeft: "4px solid #D4A500", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, color: "#999" }}>{c.period}</div>
                  <div style={{ fontSize: 15, color: "#2B3490", fontWeight: 600, marginTop: 4 }}>{c.desc}</div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#2B3490" }}>{c.amount}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "linear-gradient(135deg, #2B3490, #1a1d4d)", borderRadius: 12, padding: 32, color: "white", marginTop: 32 }}>
            <h3 style={{ color: "#D4A500", fontSize: 20, fontWeight: 700, marginBottom: 16 }}>KSRMCE Friends Association (1985-89 Batch)</h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: "white" }}>
              <li style={{ marginBottom: 12 }}>Financially helped poor students</li>
              <li style={{ marginBottom: 12 }}>Built kitchen and dining facilities for tribal girls school at Araku, Vizag</li>
              <li style={{ marginBottom: 12 }}>Donated a room for mentally challenged school &quot;Anurag Foundation&quot; at Hyderabad</li>
              <li>Built a shelter for patient attendants at RIMS, Kadapa</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="activities" style={{ padding: "80px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Activity Reports</h2>
          <div className="alumni-activity-grid">
            {activityReports.map((r) => (
              <a key={r.title} href={r.href} target="_blank" rel="noopener noreferrer" style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: 20, display: "flex", alignItems: "center", gap: 16, textDecoration: "none" }}>
                <div style={{ background: "#eef1ff", width: 44, height: 44, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📋</div>
                <div style={{ flex: 1, color: "#2B3490", fontWeight: 500, fontSize: 14 }}>{r.title}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section id="top-alumni" style={{ padding: "80px 0", background: "white" }}>
        <div className="responsive-container">
          <h2 style={{ fontSize: "clamp(2rem, 3vw, 2.6rem)", fontWeight: 800, fontFamily: "'Rajdhani', sans-serif", color: "#2B3490", marginBottom: 48, textAlign: "center" }}>Top Alumni</h2>
          <div className="alumni-top-grid">
            <a href={mediaFile(217)} target="_blank" rel="noopener noreferrer" style={{ background: "#2B3490", color: "white", borderRadius: 12, padding: 32, textAlign: "center", textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#D4A500", marginBottom: 16 }}>Top Alumni List</div>
              <div style={{ background: "#D4A500", color: "#2B3490", padding: "10px 24px", borderRadius: 6, fontWeight: 700, fontSize: 14, display: "inline-block", marginTop: 8 }}>Download PDF →</div>
            </a>
            <a href={mediaFile(218)} target="_blank" rel="noopener noreferrer" style={{ background: "#2B3490", color: "white", borderRadius: 12, padding: 32, textAlign: "center", textDecoration: "none", display: "block" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#D4A500", marginBottom: 16 }}>Top Alumni List (Part 2)</div>
              <div style={{ background: "#D4A500", color: "#2B3490", padding: "10px 24px", borderRadius: 6, fontWeight: 700, fontSize: 14, display: "inline-block", marginTop: 8 }}>Download PDF →</div>
            </a>
          </div>
          <div style={{ background: "#f4f3ef", borderRadius: 12, padding: 40, textAlign: "center" }}>
            <h3 style={{ color: "#2B3490", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Are You a KSRMCE Alumni?</h3>
            <p style={{ color: "#666", fontSize: 16, margin: "12px 0 24px" }}>Join our alumni network and stay connected with your alma mater.</p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <a href="https://ksrmce.ac.in/alumniregistration.php" target="_blank" rel="noopener noreferrer" style={{ background: "#2B3490", color: "#D4A500", padding: "14px 32px", borderRadius: 8, fontWeight: 700, fontSize: 16, textDecoration: "none", display: "inline-block" }}>Register as Alumni →</a>
              <a href="https://drive.google.com/drive/folders/10P_ptDp8fsxF93BKfyjxK38YQqojWLmC" target="_blank" rel="noopener noreferrer" style={{ background: "white", border: "2px solid #2B3490", color: "#2B3490", padding: "12px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>📷 View Photo Gallery →</a>
            </div>
          </div>
        </div>
      </section>
      <PageResources section="alumni" />
    </main>
  );
}
