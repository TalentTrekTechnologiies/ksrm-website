import Link from "next/link";

export const metadata = {
  title: "Cultural Club | KSRM College of Engineering",
  description:
    "KSRM College of Engineering Cultural Club celebrating creativity, talent and the spirit of togetherness through KALAKRITI and cultural events.",
};

const events = [
  {
    icon: "🎓",
    title: "AARABDH",
    description: "Freshers' Day celebration welcoming new students to campus",
    month: "August",
  },
  {
    icon: "🎨",
    title: "Holi",
    description: "Festival of colors celebrating joy, unity, and cultural diversity",
    month: "March",
  },
  {
    icon: "🌾",
    title: "Sankranthi Sambaralu",
    description: "Traditional harvest festival celebration with cultural programs",
    month: "January",
  },
  {
    icon: "🕉️",
    title: "Sivananda Smaranam",
    description: "Tribute to spiritual and cultural heritage through music and dance",
    month: "September",
  },
  {
    icon: "🎉",
    title: "Ugadi",
    description: "Telugu New Year celebration with cultural and traditional programs",
    month: "March/April",
  },
  {
    icon: "🎵",
    title: "World Music Day",
    description: "International celebration of music and performing arts",
    month: "June",
  },
];

const committee = [
  {
    name: "Sri B. Veera Sankar",
    role: "Assistant Professor, Humanities & Sciences",
    position: "Coordinator",
    focus: "Cultural Programs",
  },
  {
    name: "Smt V. Sudha",
    role: "Assistant Professor, Computer Science & Engineering",
    position: "Member",
    focus: "Events & Logistics",
  },
  {
    name: "Smt E. Reddy Gouthami",
    role: "Assistant Professor, Mechanical Engineering",
    position: "Member",
    focus: "Cultural Coordination",
  },
  {
    name: "Miss S. Swetha",
    role: "Assistant Professor, Electronics & Communication",
    position: "Member",
    focus: "Creative Arts",
  },
  {
    name: "Miss K. Naga Divya",
    role: "Assistant Professor, Electrical & Electronics",
    position: "Member",
    focus: "Performance Arts",
  },
  {
    name: "Dr. C. Manoj",
    role: "Assistant Professor, Humanities & Sciences",
    position: "Member",
    focus: "Cultural Heritage",
  },
];

export default function CulturalClubPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      {/* Hero */}
      <section
        style={{
          backgroundImage: "url('/header.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: 240,
          display: "flex",
          alignItems: "flex-end",
          paddingBottom: 20,
        }}
      >
        <div style={{ width: "100%", maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", gap: 8, fontSize: 14, color: "#fff" }}>
            <Link href="/" style={{ color: "#D4A500", textDecoration: "none" }}>
              Home
            </Link>
            <span>/</span>
            <Link href="/campus-life" style={{ color: "#D4A500", textDecoration: "none" }}>
              Campus Life
            </Link>
            <span>/</span>
            <span>Cultural Club</span>
          </div>
        </div>
      </section>

      {/* About */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <p
            style={{
              fontSize: 16,
              color: "#555",
              lineHeight: 1.8,
              textAlign: "justify",
              maxWidth: 900,
              margin: "0 auto",
            }}
          >
            The Cultural Club at KSRMCE nurtures the artistic and creative
            talents of students through a vibrant calendar of cultural
            events, festivals, and celebrations throughout the year. It
            serves as a platform for students to showcase their talents in
            music, dance, drama, and other performing arts while promoting
            cultural awareness and social cohesion.
          </p>
        </div>
      </section>

      {/* Annual Events */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#2B3490",
              margin: "0 0 48px",
              textAlign: "center",
            }}
          >
            Annual Events
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 24,
              marginTop: 40,
            }}
          >
            {events.map((event) => (
              <div
                key={event.title}
                style={{
                  background: "#fff",
                  padding: 28,
                  borderRadius: 8,
                  borderTop: "4px solid #D4A500",
                  boxShadow: "0 4px 12px rgba(43, 52, 144, 0.08)",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>
                  {event.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#2B3490",
                    margin: "0 0 8px",
                  }}
                >
                  {event.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#666",
                    lineHeight: 1.6,
                    margin: "0 0 12px",
                  }}
                >
                  {event.description}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    color: "#999",
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  📅 {event.month}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Committee */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 40px" }}>
          <h2
            style={{
              fontFamily: "var(--font-rajdhani), sans-serif",
              fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
              fontWeight: 700,
              color: "#2B3490",
              margin: "0 0 48px",
              textAlign: "center",
            }}
          >
            Committee Members
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 28,
              marginTop: 40,
            }}
          >
            {committee.map((member) => (
              <div
                key={member.name}
                style={{
                  background: "linear-gradient(135deg, #2B3490 0%, #1e2570 100%)",
                  color: "#fff",
                  padding: 32,
                  borderRadius: 12,
                  textAlign: "center",
                  boxShadow: "0 4px 12px rgba(43, 52, 144, 0.1)",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#D4A500",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 8,
                  }}
                >
                  {member.position}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-rajdhani), sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    margin: "0 0 4px",
                  }}
                >
                  {member.name}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    margin: "0 0 16px",
                    lineHeight: 1.5,
                    opacity: 0.8,
                  }}
                >
                  {member.role}
                </p>
                <p
                  style={{
                    fontSize: 13,
                    margin: 0,
                    opacity: 0.7,
                  }}
                >
                  {member.focus}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
