import PageResources from "@/components/PageResources";
import CmsVideos from "@/components/CmsVideos";
import CmsText from "@/components/CmsText";

﻿// Named, so a visitor can tell which building each clip is of. These were bare
// file paths, and the grid showed eight unlabelled videos. Titles for videos
// managed in the CMS come from the record itself; these cover the built-in
// clips that ship with the page.
//
// The Silver Jubilee filename is misspelt "sliver" on disk - kept as it is,
// since renaming the file would break the clip for no gain.
const tourVideos = [
  { src: "/videos/main-block.mp4", title: "Main Block" },
  { src: "/videos/civil-block.mp4", title: "Civil Block" },
  { src: "/videos/mechanical-block.mp4", title: "Mechanical Block" },
  { src: "/videos/block-e.mp4", title: "Block E" },
  { src: "/videos/sliver-jubilee-block.mp4", title: "Silver Jubilee Block" },
  { src: "/videos/kor-auditorium.mp4", title: "K.O.R. Auditorium" },
  { src: "/videos/pg-block.mp4", title: "PG Block" },
  { src: "/videos/3d-robo.mp4", title: "3D Robotics Laboratory" },
];

const stats = [
  { icon: "📍", value: "25 Acres", label: "Campus Area" },
  { icon: "🏢", value: "12", label: "Buildings" },
  { icon: "🔬", value: "60+", label: "Labs" },
  { icon: "🏫", value: "80+", label: "Classrooms" },
];

const filters = ["All", "Academic", "Residential", "Amenities", "Sports & Recreation", "Events"];

const facilities = [
  { title: "Classrooms", desc: "Spacious, well-ventilated classrooms equipped with projectors, smart boards and adequate seating for effective learning", cat: "Academic" },
  { title: "Computer Labs", desc: "Modern computer labs with high-end workstations, licensed software and 24/7 high-speed internet connectivity", cat: "Academic" },
  { title: "Research Labs", desc: "Dedicated research laboratories in each department for advanced experimentation and innovation", cat: "Academic" },
  { title: "Central Library", desc: "A knowledge hub with 45,000+ books, journals, digital resources and a quiet reading environment", cat: "Academic" },
  { title: "Seminar Halls", desc: "Air-conditioned seminar halls with audio-visual equipment for conferences, workshops and events", cat: "Academic" },
  { title: "Boys Hostel", desc: "On-campus accommodation for 300+ boys with mess, Wi-Fi, security and recreational facilities", cat: "Residential" },
  { title: "Girls Hostel", desc: "Safe on-campus accommodation for 200+ girls with 24/7 CCTV surveillance and dedicated warden", cat: "Residential" },
  { title: "Canteen & Mess", desc: "Hygienic, affordable food served in the campus canteen and hostel mess — vegetarian and non-vegetarian options", cat: "Amenities" },
  { title: "Medical Centre", desc: "First aid and health services available on campus with doctor on call", cat: "Amenities" },
  { title: "ATM", desc: "ATM facility available within campus premises for the convenience of students and staff", cat: "Amenities" },
  { title: "Sports Complex", desc: "Indoor sports hall, cricket ground, football field, basketball and volleyball courts for athletic pursuits", cat: "Sports & Recreation" },
  { title: "Auditorium", desc: "Large auditorium for convocations, cultural events, seminars and college functions with modern facilities", cat: "Events" },
  { title: "Transport Fleet", desc: "Fleet of 25+ buses connecting Kadapa city and surrounding districts for students and staff transportation", cat: "Amenities" },
  { title: "Wi-Fi Campus", desc: "High-speed Wi-Fi connectivity across academic buildings and hostels for seamless connectivity", cat: "Amenities" },
  { title: "CCTV Surveillance", desc: "Round-the-clock CCTV monitoring across all campus areas for safety and security of students and staff", cat: "Amenities" },
  { title: "Power Backup", desc: "Uninterrupted power supply through generators ensuring 24/7 power availability for all campus operations", cat: "Amenities" },
];

const exploreSections = [
  {
    title: "🔬 Laboratories",
    images: [
      { src: "/site-images/lab.jpg", alt: "Robotics laboratory with ABB robotic arm" },
      { src: "/site-images/roboticslab.jpg", alt: "Robotic 3D printing lab" },
      { src: "/site-images/ab.jpg", alt: "Computer laboratory" },
    ],
  },
  {
    title: "📚 Library",
    images: [
      { src: "/site-images/library.jpg", alt: "Central Library building" },
      { src: "/site-images/studentsinlib.jpg", alt: "Students reading in library" },
      { src: "/site-images/studentsinlib2.jpg", alt: "Students studying in library" },
    ],
  },
  {
    title: "🏆 Sports & Grounds",
    images: [
      { src: "/site-images/volleyball.jpg", alt: "Volleyball match" },
      { src: "/site-images/sportsg3.jpg", alt: "Indoor badminton court" },
      { src: "/site-images/sportsground.jpg", alt: "Basketball court" },
      { src: "/site-images/sportsground2.jpg", alt: "Sports ground aerial view" },
    ],
  },
  {
    title: "🎉 Events & Activities",
    images: [
      { src: "/site-images/fest.jpg", alt: "Award ceremony" },
      { src: "/site-images/fest2.jpg", alt: "Cultural fest performance" },
      { src: "/site-images/event.jpg", alt: "KGCET poster launch" },
    ],
  },
  {
    title: "🚌 Transportation",
    images: [{ src: "/site-images/buses.jpg", alt: "K.S.R.M. college bus fleet" }],
  },
];

export default function CampusFacilitiesPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .cf-hero { position: relative; background-image: url('/banners/campus-facilities.webp'); background-size: cover; background-position: center; background-color: #2B3490; min-height: 280px; display: flex; align-items: flex-end; overflow: hidden; padding-bottom: 40px; }
        .cf-hero::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%); pointer-events: none; }
        .cf-hero > * { position: relative; z-index: 2; }
        .cf-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #D4A500; }
        .cf-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-top: 24px; }
        .cf-breadcrumb a { color: #D4A500; text-decoration: none; }
        .cf-breadcrumb span { color: #D4A500; }
        .cf-stats-bar { background: #2B3490; padding: 32px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 32px; margin-top: 40px; }
        .cf-stat-item { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
        .cf-stat-icon { width: 48px; height: 48px; background: rgba(255,230,25,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #D4A500; font-size: 20px; }
        .cf-stat-number { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; color: #D4A500; }
        .cf-stat-label { font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px; }
        .cf-filters { display: flex; gap: 12px; margin: 40px 0; flex-wrap: wrap; }
        .cf-filter-btn { padding: 8px 16px; border-radius: 20px; border: 1.5px solid #eef0f3; background: #fff; color: #555; font-size: 14px; font-weight: 600; font-family: 'Rajdhani', sans-serif; }
        .cf-filter-btn.active { background: #2B3490; color: #fff; border-color: #2B3490; }
        .cf-facility-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 40px; }
        .cf-facility-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 12px; }
        .cf-facility-icon { width: 48px; height: 48px; background: #eef1ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
        .cf-facility-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0; }
        .cf-facility-card p { font-size: 14px; color: #555; line-height: 1.6; margin: 0; }
        .cf-category-badge { display: inline-block; background: #D4A500; color: #2B3490; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; margin-top: 8px; }
        .cf-contact-card { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); border-radius: 12px; padding: 40px; color: #fff; margin-top: 40px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; }
        .cf-contact-item h4 { font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #D4A500; margin: 0; }
        .cf-contact-item p { font-size: 15px; margin: 8px 0 0; line-height: 1.6; }
        .cf-contact-item a { color: #D4A500; text-decoration: none; }

        .cf-video-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 40px; }
        .cf-video-wrap { border-radius: 8px; overflow: hidden; }
        .cf-video-wrap video { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; }
        .cf-explore-imggrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; }
        .cf-explore-img { position: relative; height: 200px; border-radius: 12px; overflow: hidden; margin: 0; }
        .cf-explore-img img { width: 100%; height: 100%; object-fit: cover; }
        /* Over the photo rather than below it, so a caption never changes the
           height of a cell and breaks the grid alignment. The gradient keeps
           the text readable on a light photo as well as a dark one. */
        .cf-explore-img figcaption {
          position: absolute; left: 0; right: 0; bottom: 0; padding: 22px 12px 10px;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.72) 60%);
          color: #fff; font-size: 13px; font-weight: 600; line-height: 1.35;
        }
      `}</style>

      <section className="cf-hero">
        <div className="responsive-container">
          <div className="cf-eyebrow" style={{ marginBottom: 16 }}>Campus Life</div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}><CmsText section="campus-facilities" slot="campus-facilities" /></h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}><CmsText section="campus-facilities" slot="a-world-class-campus-built" /></p>
        </div>
      </section>

      <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <div style={{ maxWidth: 820 }}>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0 }}><CmsText section="campus-facilities" slot="spread-across-a-lush-green" multiline /></p>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", margin: "0 0 40px" }}><CmsText section="campus-facilities" slot="campus-infrastructure-tours" /></h2>
          {/* CMS-managed (Page Content -> Campus Facilities -> Videos), with the
              built-in tour list as the fallback. */}
          <CmsVideos
            section="campus-facilities"
            fallback={tourVideos}
            gridClassName="cf-video-grid"
            itemClassName="cf-video-wrap"
            showTitles
          />
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}><CmsText section="campus-facilities" slot="campus-overview" /></h2>
          <div className="cf-stats-bar">
            {stats.map((s, _i) => (
              <div className="cf-stat-item" key={s.label}>
                <div className="cf-stat-icon">{s.icon}</div>
                <div className="cf-stat-number">{s.value}</div>
                <div className="cf-stat-label"><CmsText section="campus-facilities" slot={`stats.${_i}.label`} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}><CmsText section="campus-facilities" slot="campus-facilities-2" /></h2>
          <div className="cf-filters">
            {filters.map((f, i) => (
              <button key={f} className={`cf-filter-btn${i === 0 ? " active" : ""}`}>{f}</button>
            ))}
          </div>
          <div className="cf-facility-grid">
            {facilities.map((f, _i) => (
              <div className="cf-facility-card" key={f.title}>
                <div className="cf-facility-icon">🏛️</div>
                <h3><CmsText section="campus-facilities" slot={`facilities.${_i}.title`} /></h3>
                <p><CmsText section="campus-facilities" slot={`facilities.${_i}.desc`} /></p>
                <div className="cf-category-badge"><CmsText section="campus-facilities" slot={`facilities.${_i}.cat`} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}><CmsText section="campus-facilities" slot="explore-our-facilities" /></h2>
          {exploreSections.map((sec, _i) => (
            <div style={{ marginBottom: 56 }} key={sec.title}>
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#2B3490", margin: "0 0 20px" }}><CmsText section="campus-facilities" slot={`exploreSections.${_i}.title`} /></h3>
              <div className="cf-explore-imggrid">
                {sec.images.map((img) => (
                  <figure className="cf-explore-img" key={img.src}>
                    <img src={img.src} alt={img.alt} loading="lazy" />
                    {/* The alt text already names the photo, so it doubles as
                        the caption - one string to keep right rather than two
                        that can drift apart. */}
                    <figcaption>{img.alt}</figcaption>
                  </figure>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="cf-contact-card">
            <div className="cf-contact-item">
              <h4><CmsText section="campus-facilities" slot="campus-administration" /></h4>
              <p><CmsText section="campus-facilities" slot="for-questions-about-campus-facilities" /></p>
            </div>
            <div className="cf-contact-item">
              <h4><CmsText section="campus-facilities" slot="phone" /></h4>
              <p><a href="tel:+91 9000073434">+91 9000073434</a></p>
            </div>
            <div className="cf-contact-item">
              <h4><CmsText section="campus-facilities" slot="email" /></h4>
              <p><a href="mailto:principal@ksrmce.ac.in">principal@ksrmce.ac.in</a></p>
            </div>
          </div>
        </div>
      </section>
    
      <PageResources section="campus-facilities" hideVideos />
      </main>
  );
}

