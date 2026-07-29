import PageResources from "@/components/PageResources";
const hostels = [
  { title: "Boys' Hostel", tag: "Male Students", desc: "Spacious, well-furnished accommodation with dedicated study areas and recreational facilities.", count: "200+ Students", options: "Single, Double, Triple sharing options" },
  { title: "Girls' Hostel", tag: "Female Students", desc: "Secure, comfortable living spaces with modern amenities and supervised environment.", count: "150+ Students", options: "Single, Double, Triple sharing options" },
];

const tourVideos = ["/videos/hostel-kandula.mp4", "/videos/hostel-ganesh.mp4"];

const facilities = [
  { icon: "🛏️", title: "Spacious Rooms", desc: "Well-ventilated, comfortable rooms with modern furnishings" },
  { icon: "🍽️", title: "Nutritious Mess Food", desc: "Hygienic, nutritious meals prepared by experienced kitchen staff" },
  { icon: "🔒", title: "24/7 Security", desc: "Round-the-clock security personnel and CCTV surveillance for student safety" },
  { icon: "📶", title: "Wi-Fi Connectivity", desc: "High-speed internet access in rooms and common areas" },
  { icon: "🎮", title: "Recreation Areas", desc: "Game rooms, TV lounges, and outdoor sports facilities for leisure activities" },
  { icon: "⚕️", title: "Medical Care", desc: "On-campus medical center with qualified staff for health support" },
  { icon: "🧺", title: "Laundry Services", desc: "In-house laundry facilities with regular washing and ironing services" },
  { icon: "💧", title: "RO Drinking Water", desc: "Pure, filtered drinking water available round-the-clock" },
  { icon: "📚", title: "Study Areas", desc: "Quiet common rooms and reading halls for academic work" },
  { icon: "🔧", title: "Maintenance & Upkeep", desc: "Regular maintenance and housekeeping to ensure cleanliness" },
];

export default function HostelsPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .hostels-hero { position: relative; background-image: url('/banners/hostels.png'); background-size: cover; background-position: center; background-color: #2B3490; min-height: 320px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .hostels-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%); z-index: 1; }
        .hostels-hero > * { position: relative; z-index: 2; }
        .hostels-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem); font-weight: 700; color: #fff; margin: 0; text-shadow: 0 2px 12px rgba(0,0,0,0.7); line-height: 1.08; }
        .hostels-subtitle { color: rgba(255,255,255,0.95); font-size: 19px; margin: 16px 0 0; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }
        .hostels-about-text { font-size: 17px; color: #555; line-height: 1.8; text-align: justify; max-width: 900px; margin: 0 auto; }
        .hostels-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }
        .hostels-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 40px; }
        .hostel-card { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); color: #fff; padding: 28px; border-radius: 8px; }
        .hostel-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; margin: 0 0 8px; }
        .hostel-card p { font-size: 15px; line-height: 1.6; margin: 8px 0; opacity: 0.9; }
        .facilities-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 40px; }
        .facility-card { background: #fff; border: 1px solid #eef0f3; border-radius: 8px; padding: 20px; text-align: center; }
        .facility-icon { font-size: clamp(19px, 5.1vw, 32px); margin-bottom: 12px; }
        .facility-card h4 { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: #2B3490; margin: 0 0 8px; }
        .facility-card p { font-size: 14px; color: #666; line-height: 1.5; margin: 0; }
        @media (max-width: 768px) { .hostels-grid { grid-template-columns: 1fr; } .facilities-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="hostels-hero">
        <div className="responsive-container">
          <h1 className="hostels-title">Student Hostels</h1>
          <p className="hostels-subtitle">Safe, Comfortable Living on Campus</p>
          <div style={{ display: "flex", gap: 8, fontSize: 14, marginTop: 16, color: "rgba(255,255,255,0.7)" }}>
            <a style={{ color: "#D4A500" }} href="/">Home</a><span>/</span>
            <a style={{ color: "#D4A500" }} href="/campus-life">Campus Life</a><span>/</span>
            <span>Student Hostels</span>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <p className="hostels-about-text">
            KSRMCE provides separate, well-maintained hostel facilities for boys and girls within the campus. The
            hostels offer a safe, comfortable, and conducive environment for students to live and study, with modern
            amenities and round-the-clock security. Our hostels foster a sense of community and provide essential
            support for residential students.
          </p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="hostels-heading">Our Hostels</h2>
          <div className="hostels-grid">
            {hostels.map((h) => (
              <div className="hostel-card" key={h.title}>
                <h3>{h.title}</h3>
                <p><strong>{h.tag}</strong></p>
                <p>{h.desc}</p>
                <p style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.3)" }}>
                  👥 {h.count}<br />🏠 {h.options}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="hostels-heading">Hostel Tours</h2>
          <div className="hostels-grid">
            {tourVideos.map((v) => (
              <div style={{ borderRadius: 8, overflow: "hidden" }} key={v}>
                <video autoPlay loop muted playsInline style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }}>
                  <source src={v} type="video/mp4" />
                </video>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="hostels-heading">Facilities</h2>
          <div className="facilities-grid">
            {facilities.map((f) => (
              <div className="facility-card" key={f.title}>
                <div className="facility-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PageResources section="hostels" />
    </main>
  );
}

