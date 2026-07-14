import PageResources from "@/components/PageResources";

const objectives = [
  "To develop and introduce curriculum on Entrepreneurship Development at various levels including degree/diploma courses",
  "To organize Entrepreneurship Awareness Camps, Development Programmes and faculty development programmes",
  "To organize guest lectures, seminars for promotion of science and technology based entrepreneurship",
  "To arrange industry visits for prospective entrepreneurs",
  "To extend guidance and escort services to trainees in obtaining approval and execution of their projects",
  "To act as a regional information center on business opportunities, processes, technologies, and markets",
  "To render advice to sick enterprises and assist entrepreneurs in rehabilitating them",
];

const eacCamps = [
  "4 in 2012-13",
  "2 in 2013-14",
  "1 in 2014-15",
  "2 in 2015-16",
  "1 in 2017-18",
  "2 in 2018-19",
  "2 in 2019-20",
];

const committee = [
  { name: "Dr. B. Sudarshan", role: "Associate Professor of Mechanical Engineering", tag: "Coordinator" },
  { name: "K. Yaswanth Reddy", role: "Student (V sem) Mechanical Engineering", tag: "Member" },
  { name: "K. Prudhvi", role: "Student (V sem) Mechanical Engineering", tag: "Member" },
  { name: "G. Charan Kumar Reddy", role: "Student (III sem) Mechanical Engineering", tag: "Member" },
];

export default function EDCPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { width: 100%; max-width:  1720px; margin: 0 auto; padding-left: 40px; padding-right: 40px; }
        @media (max-width: 1024px) { .responsive-container { padding-left: 32px; padding-right: 32px; } }
        @media (max-width: 768px) { .responsive-container { padding-left: 20px; padding-right: 20px; } }
        @media (max-width: 480px) { .responsive-container { padding-left: 14px; padding-right: 14px; } }

        .edc-hero {
          position: relative; background-image: url('/banners/edc.png'); background-size: cover;
          background-position: center; background-color: #f5f5f5; min-height: 320px; display: flex;
          align-items: flex-end; padding-bottom: 40px; overflow: hidden;
        }
        .edc-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%); z-index: 1; }
        .edc-hero > * { position: relative; z-index: 2; }
        .edc-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem); font-weight: 700; color: #fff; margin: 0; text-shadow: 0 2px 12px rgba(0,0,0,0.7); line-height: 1.08; }
        .edc-subtitle { color: rgba(255,255,255,0.95); font-size: 19px; margin: 16px 0 0; text-shadow: 0 2px 8px rgba(0,0,0,0.6); font-weight: 400; }
        .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; margin-bottom: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }
        .breadcrumb a { color: #D4A500; text-decoration: none; }
        .breadcrumb span { color: rgba(255,255,255,0.7); }

        .edc-about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
        .edc-about-text { font-size: 17px; color: #555; line-height: 1.8; text-align: justify; margin: 0; }
        .edc-meta { display: flex; flex-direction: column; gap: 24px; }
        .edc-meta-item { display: flex; flex-direction: column; gap: 8px; }
        .edc-meta-label { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; color: #D4A500; text-transform: uppercase; letter-spacing: 1px; }
        .edc-meta-value { font-size: 17px; color: #2B3490; font-weight: 600; }

        .edc-vision-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .edc-vision-card { background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(43,52,144,0.08); }
        .edc-vision-title { font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 700; color: #2B3490; margin-bottom: 16px; }
        .edc-vision-text { font-size: 17px; color: #555; line-height: 1.8; margin: 0; }

        .edc-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; }
        .edc-objectives-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .edc-objective-card { background: #f7f8fa; border-left: 4px solid #D4A500; padding: 24px; border-radius: 8px; }
        .edc-objective-text { font-size: 17px; color: #555; line-height: 1.7; margin: 0; }

        .edc-dst-card { background: rgba(255,255,255,0.95); padding: 48px; border-radius: 12px; box-shadow: 0 12px 48px rgba(0,0,0,0.2); }
        .edc-dst-title { font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; color: #2B3490; margin: 0 0 16px; }
        .edc-dst-content { font-size: 17px; color: #555; line-height: 1.8; margin: 0 0 24px; }
        .edc-dst-camps { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; }
        .edc-dst-camp-badge { background: #D4A500; color: #2B3490; padding: 12px 16px; border-radius: 6px; font-weight: 600; text-align: center; font-size: 15px; }

        .edc-committee-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(43,52,144,0.08); }
        .edc-committee-table th { background: #2B3490; color: #fff; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 16px; padding: 18px; text-align: left; border-bottom: 2px solid #D4A500; }
        .edc-committee-table td { padding: 16px 18px; border-bottom: 1px solid #eef0f3; font-size: 16px; color: #555; }
        .edc-committee-table tr:last-child td { border-bottom: none; }
        .edc-committee-name { font-family: 'Rajdhani', sans-serif; font-weight: 700; color: #2B3490; }
        .edc-committee-role { font-weight: 600; color: #D4A500; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }

        @media (max-width: 1024px) { .edc-about-grid { grid-template-columns: 1fr; } .edc-vision-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="edc-hero">
        <div className="responsive-container">
          <div style={{ padding: "0 0 32px 0" }}>
            <h1 className="edc-title">Entrepreneurship Development Cell (EDC)</h1>
            <p className="edc-subtitle">Developing Entrepreneurs Since August 2005</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="edc-about-grid">
            <p className="edc-about-text">
              Entrepreneurs play a vital role in the economic development of any region or country. An entrepreneur
              is a person who organizes, manages and takes the risk of running an enterprise. It is proven that with
              the right training and adequate motivation, entrepreneurs can be developed. With this objective, the
              Entrepreneurship Development Cell organizes entrepreneurship development programmes and regularly
              invites successful entrepreneurs to share their experiences with students. The cell considers its
              major role is to develop employment providers, not employment seekers. Established in August 2005, the
              cell plans and implements entrepreneurship development programs including training, education,
              research and consultancy.
            </p>
            <div className="edc-meta">
              <div className="edc-meta-item"><span className="edc-meta-label">Established</span><span className="edc-meta-value">August 2005</span></div>
              <div className="edc-meta-item"><span className="edc-meta-label">Coordinator</span><span className="edc-meta-value">Dr. B. Sudarshan</span></div>
              <div className="edc-meta-item"><span className="edc-meta-label">Designation</span><span className="edc-meta-value">Associate Professor, Mechanical Engineering</span></div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <div className="edc-vision-grid">
            <div className="edc-vision-card">
              <h2 className="edc-vision-title">Vision</h2>
              <p className="edc-vision-text">
                To be a well-recognized center of excellence for entrepreneurship development programmes based in an
                institute of quality learning.
              </p>
            </div>
            <div className="edc-vision-card">
              <h2 className="edc-vision-title">Mission</h2>
              <p className="edc-vision-text">To train and develop Successful Entrepreneurs towards evergreen economic prosperity.</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="edc-section-heading">Our Objectives</h2>
          <div className="edc-objectives-grid">
            {objectives.map((o) => (
              <div className="edc-objective-card" key={o}><p className="edc-objective-text">{o}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "linear-gradient(135deg, #2B3490 0%, #1e2570 100%)" }}>
        <div className="responsive-container">
          <div className="edc-dst-card">
            <h2 className="edc-dst-title">DST/NSTEDB Sponsorship</h2>
            <p className="edc-dst-content">
              The NSTEDB (National Science and Technology Entrepreneurship Development Board), DST, New Delhi
              sanctioned multiple Entrepreneurship Awareness Camps (EACs):
            </p>
            <div className="edc-dst-camps">
              {eacCamps.map((c) => <div className="edc-dst-camp-badge" key={c}>{c}</div>)}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="edc-section-heading">Committee Members</h2>
          <table className="edc-committee-table">
            <thead><tr><th>Name</th><th>Designation</th><th>Role</th></tr></thead>
            <tbody>
              {committee.map((m) => (
                <tr key={m.name}>
                  <td className="edc-committee-name">{m.name}</td>
                  <td>{m.role}</td>
                  <td><span className="edc-committee-role">{m.tag}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <PageResources section="edc" />
    </main>
  );
}
