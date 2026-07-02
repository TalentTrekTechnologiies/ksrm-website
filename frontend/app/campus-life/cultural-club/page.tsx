'use client';

import { motion } from 'framer-motion';

const events = [
  { icon: '🎓', title: 'AARABDH', desc: "Freshers' Day celebration welcoming new students to campus", month: 'August' },
  { icon: '🎨', title: 'Holi', desc: 'Festival of colors celebrating joy, unity, and cultural diversity', month: 'March' },
  { icon: '🌾', title: 'Sankranthi Sambaralu', desc: 'Traditional harvest festival celebration with cultural programs', month: 'January' },
  { icon: '🕉️', title: 'Sivananda Smaranam', desc: 'Tribute to spiritual and cultural heritage through music and dance', month: 'September' },
  { icon: '🎉', title: 'Ugadi', desc: 'Telugu New Year celebration with cultural and traditional programs', month: 'March/April' },
  { icon: '🎵', title: 'World Music Day', desc: 'International celebration of music and performing arts', month: 'June' },
];

const committee = [
  { name: 'Sri B. Veera Sankar', role: 'Assistant Professor, Humanities & Sciences', position: 'Coordinator', specialty: 'Cultural Programs' },
  { name: 'Smt V. Sudha', role: 'Assistant Professor, Computer Science & Engineering', position: 'Member', specialty: 'Events & Logistics' },
  { name: 'Smt E. Reddy Gouthami', role: 'Assistant Professor, Mechanical Engineering', position: 'Member', specialty: 'Cultural Coordination' },
  { name: 'Miss S. Swetha', role: 'Assistant Professor, Electronics & Communication', position: 'Member', specialty: 'Creative Arts' },
  { name: 'Miss K. Naga Divya', role: 'Assistant Professor, Electrical & Electronics', position: 'Member', specialty: 'Performance Arts' },
  { name: 'Dr. C. Manoj', role: 'Assistant Professor, Humanities & Sciences', position: 'Member', specialty: 'Cultural Heritage' },
];

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };

export default function CulturalClubPage() {
  return (
    <main style={{ background: '#ffffff' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .responsive-container { max-width: 1400px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .cc-hero { position: relative; background-image: url('/banner/cultural-banner.jpg'); background-size: cover; background-position: center; background-color: #2B3490; min-height: 320px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .cc-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 100%); pointer-events: none; }
        .cc-hero > * { position: relative; z-index: 2; }

        .cc-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem); font-weight: 700; color: #fff; margin: 0; text-shadow: 0 2px 12px rgba(0,0,0,0.7); line-height: 1.08; }
        .cc-subtitle { color: rgba(255,255,255,0.9); font-size: 18px; margin: 12px 0 0; text-shadow: 0 2px 8px rgba(0,0,0,0.6); font-weight: 300; }
        .cc-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 14px; color: rgba(255,255,255,0.8); margin-top: 20px; }
        .cc-breadcrumb a { color: #D4A500; text-decoration: none; font-weight: 600; }
        .cc-breadcrumb span { color: rgba(255,255,255,0.6); }

        .cc-about { padding: 72px 0; background: #ffffff; }
        .cc-about-text { font-size: 16px; line-height: 1.8; color: #555; text-align: justify; max-width: 900px; margin: 0 auto; }

        .cc-events-section { padding: 72px 0; background: #f4f3ef; }
        .cc-events-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }
        .cc-events-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .cc-event-card { background: #fff; border-radius: 8px; padding: 28px; border-top: 4px solid #D4A500; box-shadow: 0 4px 12px rgba(43,52,144,0.08); transition: all 0.3s ease; }
        .cc-event-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(43,52,144,0.12); }
        .cc-event-icon { font-size: 48px; margin-bottom: 12px; display: block; }
        .cc-event-title { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #2B3490; margin: 0 0 8px; }
        .cc-event-desc { font-size: 14px; color: #666; line-height: 1.6; margin: 0 0 12px; }
        .cc-event-month { font-size: 13px; color: #999; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

        .cc-committee-section { padding: 72px 0; background: #ffffff; }
        .cc-committee-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }
        .cc-committee-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 28px; }
        .cc-member-card { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); border-radius: 12px; padding: 32px 24px; color: #fff; text-align: center; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(43,52,144,0.1); }
        .cc-member-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(43,52,144,0.15); }
        .cc-member-name { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; margin: 0 0 4px; }
        .cc-member-role { font-size: 13px; color: rgba(255,255,255,0.8); margin: 0 0 16px; line-height: 1.5; }
        .cc-member-position { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #D4A500; margin: 0 0 8px; }
        .cc-member-specialty { font-size: 13px; color: rgba(255,255,255,0.7); margin: 0; }

        @media (max-width: 768px) {
          .cc-events-grid { grid-template-columns: 1fr; }
          .cc-committee-grid { grid-template-columns: 1fr; }
          .cc-event-card { padding: 20px; }
          .cc-member-card { padding: 24px 20px; }
        }
      `}</style>

      <motion.section className="cc-hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
        <div className="responsive-container">
          <motion.h1 className="cc-title" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>Cultural Club</motion.h1>
          <motion.p className="cc-subtitle" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>Celebrating Art, Music & Tradition</motion.p>
          <motion.div className="cc-breadcrumb" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.6 }}>
            <a href="/">Home</a>
            <span>/</span>
            <a href="/campus-life">Campus Life</a>
            <span>/</span>
            <span>Cultural Club</span>
          </motion.div>
        </div>
      </motion.section>

      <motion.section className="cc-about" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
        <div className="responsive-container">
          <p className="cc-about-text">
            The Cultural Club at KSRMCE nurtures the artistic and creative talents of students through a vibrant calendar of cultural events, festivals, and celebrations throughout the year. It serves as a platform for students to showcase their talents in music, dance, drama, and other performing arts while promoting cultural awareness and social cohesion.
          </p>
        </div>
      </motion.section>

      <motion.section className="cc-events-section" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
        <div className="responsive-container">
          <motion.h2 className="cc-events-heading" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>Annual Events</motion.h2>
          <motion.div className="cc-events-grid" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {events.map((e) => (
              <motion.div className="cc-event-card" key={e.title} variants={itemVariants}>
                <span className="cc-event-icon">{e.icon}</span>
                <h3 className="cc-event-title">{e.title}</h3>
                <p className="cc-event-desc">{e.desc}</p>
                <p className="cc-event-month">📅 {e.month}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section className="cc-committee-section" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
        <div className="responsive-container">
          <motion.h2 className="cc-events-heading" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>Committee Members</motion.h2>
          <motion.div className="cc-committee-grid" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            {committee.map((m) => (
              <motion.div className="cc-member-card" key={m.name} variants={itemVariants}>
                <div className="cc-member-position">{m.position}</div>
                <h3 className="cc-member-name">{m.name}</h3>
                <p className="cc-member-role">{m.role}</p>
                <p className="cc-member-specialty">{m.specialty}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </main>
  );
}

export const metadata = {
  title: 'Cultural Club | KSRM College of Engineering',
  description: 'KSRM College of Engineering Cultural Club celebrating creativity, talent and the spirit of togetherness through KALAKRITI and cultural events.',
};
