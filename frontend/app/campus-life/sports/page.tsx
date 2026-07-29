import PageResources from "@/components/PageResources";
const facilities = [
  { title: "Basketball Court", desc: "Full-size international basketball court with professional lighting and seating.", type: "Outdoor", cap: "500" },
  { title: "Tennis Courts", desc: "Four all-weather tennis courts with professional surface and lighting.", type: "Outdoor", cap: "200" },
  { title: "Football Ground", desc: "Full-size football pitch with natural grass, lighting, and spectator stand.", type: "Outdoor", cap: "1,000+" },
  { title: "Cricket Ground", desc: "International standard cricket ground with practice nets and pavilion.", type: "Outdoor", cap: "2,000+" },
  { title: "Badminton Hall", desc: "Air-conditioned badminton courts with professional flooring and lighting.", type: "Indoor", cap: "300" },
  { title: "Gymnasium", desc: "State-of-the-art gymnasium with cardio, strength training, and CrossFit equipment.", type: "Indoor", cap: "150" },
  { title: "Table Tennis Hall", desc: "Modern table tennis facility with 8 professional tables.", type: "Indoor", cap: "100" },
  { title: "Swimming Pool", desc: "Olympic-size swimming pool with dedicated coaching staff.", type: "Outdoor", cap: "400" },
];

type AchievementBadge = "state" | "national" | "university";

type Achievement = {
  badge: AchievementBadge;
  icon: string;
  title: string;
  result: string;
  level: string;
  year: string;
};

const achievements: Achievement[] = [
  { badge: "state", icon: "🏆", title: "Inter-College Basketball Tournament", result: "Winners (Men'\''s & Women'\''s)", level: "🏆 State Level", year: "2024" },
  { badge: "national", icon: "🥇", title: "All-India Engineering Games Cricket", result: "Runners-up (Men'\''s)", level: "🥇 National Level", year: "2024" },
  { badge: "university", icon: "🏅", title: "JNTUA Sports Championships", result: "Overall Champions", level: "🏅 University Level", year: "2023" },
  { badge: "state", icon: "🏆", title: "Marathon Championship", result: "Top 3 Finishers (10K & 21K)", level: "🏆 State Level", year: "2023" },
  { badge: "national", icon: "🥇", title: "National Badminton Championship", result: "Semi-finalists (Doubles)", level: "🥇 National Level", year: "2022" },
  { badge: "state", icon: "🏆", title: "Volleyball Tournament", result: "Winners (Women'\''s)", level: "🏆 State Level", year: "2022" },
];

const badgeColors: Record<AchievementBadge, string> = { state: "#3498db", national: "#e74c3c", university: "#27ae60" };

const achievementImages = [
  { src: "/site-images/volleyball.jpg", alt: "Volleyball match", caption: "Volleyball - Team sport excellence" },
  { src: "/site-images/sportsg3.jpg", alt: "Indoor badminton court", caption: "Indoor games - Badminton facility" },
  { src: "/site-images/sportsground.jpg", alt: "Basketball court", caption: "Basketball court - Outdoor sports" },
];

const upcomingEvents = [
  { title: "Inter-Class Football Tournament", date: "15-22 July 2025", venue: "College Football Ground" },
  { title: "Summer Sports Fest", date: "1-10 August 2025", venue: "Sports Complex" },
  { title: "Annual Marathon", date: "25 August 2025", venue: "Campus" },
];

export default function SportsPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .spo-hero { position: relative; background-image: url('/banners/sports.png'); background-size: cover; background-position: center; background-color: #2B3490; min-height: 280px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .spo-hero::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%); pointer-events: none; }
        .spo-hero > * { position: relative; z-index: 2; }
        .spo-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #D4A500; }
        .spo-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-top: 24px; }
        .spo-breadcrumb a { color: #D4A500; text-decoration: none; }
        .spo-breadcrumb span { color: #D4A500; }
        .spo-filters { display: flex; gap: 12px; margin: 40px 0; flex-wrap: wrap; }
        .spo-filter-btn { padding: 8px 16px; border-radius: 20px; border: 1.5px solid #eef0f3; background: #fff; color: #555; font-size: 14px; font-weight: 600; font-family: 'Rajdhani', sans-serif; }
        .spo-filter-btn.active { background: #2B3490; color: #fff; border-color: #2B3490; }
        .spo-facility-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 40px; }
        .spo-facility-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 12px; }
        .spo-facility-icon { width: 44px; height: 44px; background: #eef1ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .spo-facility-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0; }
        .spo-facility-card p { font-size: 14px; color: #555; line-height: 1.6; margin: 0; }
        .spo-facility-meta { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eef0f3; font-size: 13px; color: #666; }
        .spo-achievements-container { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
        .spo-achievement-card { background: #f4f3ef; border-left: 4px solid #2B3490; padding: 20px; border-radius: 8px; display: flex; gap: 16px; margin-bottom: 16px; }
        .spo-achievement-badge { flex-shrink: 0; width: 56px; height: 56px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; }
        .spo-achievement-content h4 { font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: #1a1a2e; margin: 0 0 4px; }
        .spo-achievement-content p { font-size: 14px; color: #555; margin: 0; line-height: 1.6; }
        .spo-achievement-level { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 8px; }
        .spo-achievements-image { position: relative; height: 220px; border-radius: 12px; overflow: hidden; margin-bottom: 8px; }
        .spo-achievements-image img { width: 100%; height: 100%; object-fit: cover; }
        .spo-achievements-caption { margin-top: 16px; padding: 12px; background: #f4f3ef; border-left: 4px solid #2B3490; border-radius: 4px; font-size: 14px; color: #555; line-height: 1.6; }
        .spo-upcoming-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 40px; }
        .spo-event-card { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); color: #fff; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 12px; }
        .spo-event-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; margin: 0; }
        .spo-event-card p { font-size: 14px; margin: 0; line-height: 1.6; }
        .spo-coordinator-card { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); border-radius: 12px; padding: 40px; color: #fff; text-align: center; }
        .spo-contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; margin-top: 24px; }
        .spo-contact-item h4 { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #D4A500; margin: 0; }
        .spo-contact-item p { font-size: 15px; margin: 8px 0 0; line-height: 1.6; }
        .spo-contact-item a { color: #D4A500; text-decoration: none; }
        @media (max-width: 900px) { .spo-achievements-container { grid-template-columns: 1fr; gap: 32px; } .spo-contact-info { grid-template-columns: 1fr; } }
      `}</style>

      <section className="spo-hero">
        <div className="responsive-container">
          <div className="spo-eyebrow" style={{ marginBottom: 16 }}>Campus Life</div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}>Sports</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>Excellence Through Athletic Pursuits</p>
        </div>
      </section>

      <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <div style={{ maxWidth: 820 }}>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0 }}>
              Sports at K.S.R.M. College of Engineering is an integral part of campus life, promoting physical fitness,
              team spirit, and competitive excellence. With modern facilities and dedicated coaching staff, our
              college encourages students to participate in both indoor and outdoor sports, fostering holistic
              development.
            </p>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", margin: "0 0 40px" }}>Sports Arena Tours</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            <div style={{ borderRadius: 8, overflow: "hidden" }}>
              <video autoPlay loop muted playsInline style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }}>
                <source src="/videos/sports-arena.mp4" type="video/mp4" />
              </video>
            </div>
            <div style={{ borderRadius: 8, overflow: "hidden" }}>
              <video autoPlay loop muted playsInline style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }}>
                <source src="/videos/sports-event.mp4" type="video/mp4" />
              </video>
            </div>
            <div style={{ borderRadius: 8, overflow: "hidden" }}>
              <video autoPlay loop muted playsInline style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }}>
                <source src="/videos/sports-winners.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>Sports Facilities</h2>
          <div className="spo-filters">
            <button className="spo-filter-btn active">All Facilities</button>
            <button className="spo-filter-btn">Indoor</button>
            <button className="spo-filter-btn">Outdoor</button>
          </div>
          <div className="spo-facility-grid">
            {facilities.map((f) => (
              <div className="spo-facility-card" key={f.title}>
                <div className="spo-facility-icon">⚡</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <div className="spo-facility-meta"><span>{f.type}</span><span>Capacity: {f.cap}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}>Achievements</h2>
          <div className="spo-achievements-container">
            <div>
              {achievements.map((a) => (
                <div className="spo-achievement-card" key={a.title}>
                  <div className="spo-achievement-badge" style={{ background: badgeColors[a.badge] }}>🏆</div>
                  <div className="spo-achievement-content">
                    <h4>{a.title}</h4>
                    <p>{a.result}</p>
                    <div className="spo-achievement-level">{a.level}</div>
                    <p style={{ fontSize: 12, marginTop: 8 }}>Year: {a.year}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              {achievementImages.map((img) => (
                <div key={img.src}>
                  <div className="spo-achievements-image"><img src={img.src} alt={img.alt} /></div>
                  <p style={{ fontSize: 13, color: "#555", margin: "8px 0 0", fontWeight: 500 }}>{img.caption}</p>
                </div>
              ))}
              <div className="spo-achievements-caption">
                <strong style={{ color: "#2B3490" }}>Our Excellence:</strong> Our students excel in volleyball,
                basketball, and indoor games across inter-collegiate tournaments throughout the academic year.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}>Upcoming Events</h2>
          <div className="spo-upcoming-grid">
            {upcomingEvents.map((e) => (
              <div className="spo-event-card" key={e.title}>
                <h3>{e.title}</h3>
                <p><strong>Date:</strong> {e.date}</p>
                <p><strong>Venue:</strong> {e.venue}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <div className="spo-coordinator-card">
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, margin: "0 0 24px" }}>Dr. [Sports Coordinator]</h3>
            <p>Sports Coordinator</p>
            <div className="spo-contact-info">
              <div className="spo-contact-item">
                <h4>Phone</h4>
                <p><a href="tel:+91-8554-233333 (Ext: 340)">+91-8554-233333 (Ext: 340)</a></p>
              </div>
              <div className="spo-contact-item">
                <h4>Email</h4>
                <p><a href="mailto:sports@ksrmce.ac.in">sports@ksrmce.ac.in</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PageResources section="sports" />
    </main>
  );
}
