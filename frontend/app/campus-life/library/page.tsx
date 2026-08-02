import PageResources from "@/components/PageResources";
import CmsVideos from "@/components/CmsVideos";
import LibraryStaff from "@/components/library/LibraryStaff";
import CmsText, { CmsTextProvider } from "@/components/CmsText";

/**
 * Central Library.
 *
 * Everything here is the college's own published information, carried over from
 * the previous site's Central Library page. The page this replaced was built on
 * placeholder figures (a round "45,000+ books", subscriptions the library does
 * not actually hold, an unnamed librarian), so it is a full content rewrite
 * rather than an edit.
 *
 * Staff are CMS records (see LibraryStaff) and the tour video comes from the
 * Media Library, so the parts most likely to change are editable without a
 * deploy. The reference tables below - holdings, journal counts, rules - are
 * static because they are stable published figures, not routine edits.
 */

const stats = [
  { icon: "📚", value: "65,384", label: "Volumes" },
  { icon: "📖", value: "11,200", label: "Titles" },
  { icon: "📰", value: "96", label: "Journals" },
  { icon: "🔖", value: "300", label: "Seating" },
];

const goals = [
  "To procure textbooks and reference books to meet user needs.",
  "To purchase and collect technical and management books of National and International reputation.",
  "To subscribe and maintain Technical and Management Journals.",
  "To provide congenial environment for users within Library premises.",
  "To create and provide auxiliary services to user community to augment information dissemination.",
  "To devise and maintain procedures for smooth administration of library.",
  "To respond quickly to the needs of user community.",
];

const services = [
  { icon: "💻", title: "Digital Library", desc: "20 systems with internet access to DELNET, IEEE, NLIST, JNTUA Consortium, NDLI and NPTEL." },
  { icon: "🖨️", title: "Reprographic Services", desc: "Photocopy facility on payment basis at 50 paise per copy, 09:00 am to 05:00 pm." },
  { icon: "🌐", title: "Internet Services", desc: "Dedicated internet access for reference, research and e-resource browsing." },
  { icon: "🔍", title: "OPAC Services", desc: "Two dedicated terminals for searching the collection by Author, Title, Subject and Publisher." },
  { icon: "📰", title: "Newspaper Clipping Services", desc: "Important information from newspapers is clipped and archived for the user community." },
];

const seating = [
  { section: "Reading Section", capacity: 100 },
  { section: "Reference Section", capacity: 100 },
  { section: "Journals and News Paper Section", capacity: 100 },
  { section: "Digital Library", capacity: 30 },
];

const floors = [
  { floor: "Ground Floor", items: ["Text Book Section", "Circulation Section", "Digital Library", "Reprographic Services", "Old Question Papers", "Newspaper Clipping Service", "OPAC"] },
  { floor: "First Floor", items: ["Text Book Section", "OPAC"] },
  { floor: "Second Floor", items: ["Reference Section", "Periodicals Section", "Journals and Magazines Section", "Project Reports", "Back Volumes of Journals"] },
];

const reprographics = [
  { item: "Xerox Machine", count: 2 },
  { item: "Printer", count: 1 },
  { item: "Bar Code Printer", count: 1 },
  { item: "Bar Code Scanners", count: 2 },
];

const holdings = [
  { branch: "Civil", volumes: "11,445", titles: "1,994" },
  { branch: "CSE", volumes: "15,115", titles: "2,321" },
  { branch: "EEE", volumes: "4,410", titles: "739" },
  { branch: "ECE", volumes: "8,507", titles: "1,191" },
  { branch: "Mechanical", volumes: "8,312", titles: "1,356" },
  { branch: "Humanities & Sciences", volumes: "11,125", titles: "2,472" },
  { branch: "General", volumes: "6,460", titles: "1,127" },
];

const journals = [
  { branch: "Civil", national: 12, international: 6 },
  { branch: "CSE", national: 12, international: 6 },
  { branch: "EEE", national: 12, international: 6 },
  { branch: "ECE", national: 12, international: 6 },
  { branch: "Mechanical", national: 12, international: 6 },
  { branch: "Humanities & Sciences", national: 6, international: 0 },
];

const otherHoldings = [
  { title: "NPTEL Video Lectures", count: "3,500" },
  { title: "DVDs, CDs & Floppies", count: "3,780" },
  { title: "Question Papers (All Branches)", count: "209" },
  { title: "Newspaper Clippings", count: "392" },
  { title: "Back Volumes of National & International Journals", count: "3,292" },
  { title: "Back Volumes of Project Reports", count: "1,562" },
];

const eresources = [
  { title: "IEEE Xplore", desc: "Full-text access to IEEE transactions, conference proceedings and standards in electrical engineering and computer science." },
  { title: "DELNET", desc: "Developing Library Network - resource sharing, inter-library loan and access to a large union catalogue of Indian libraries." },
  { title: "NLIST", desc: "National Library and Information Services Infrastructure for Scholarly Content - e-journals and e-books across disciplines." },
  { title: "NDLI & NDLI Club", desc: "National Digital Library of India - a single-window search for learning resources from Indian institutions. The college runs an NDLI Club." },
  { title: "JNTUA Consortium", desc: "Consortium access provided through Jawaharlal Nehru Technological University Anantapur for affiliated colleges." },
  { title: "NPTEL", desc: "3,500 video lectures from IIT and IISc faculty across engineering, science and humanities.", href: "https://nptel.ac.in" },
];

const newspapers = [
  "The Hindu", "Deccan Chronicle", "Business Line", "Hans India", "Andhra Jyothi",
  "Eenadu", "Saakshi", "Vaartha", "Praja Sakthi", "Andhra Bhoomi", "Andhra Prabha",
];

const rules = [
  "Transaction hours: 09:00 am to 05:00 pm on all working days.",
  "Each student is allowed to loan three (03) books at any time for a loan period of 15 days.",
  "A student can extend a loan for two consecutive times, each of 15 days duration.",
  "A loan can be extended if the renewal request is made within the due date. A loan cannot be extended after the due date.",
  "A loan is extended if there is no hold on that title.",
  "Late returns will be levied a late return fine of one rupee per day per book. After 30 days, two rupees per day per book will be collected.",
  "A student can request a hold on a book. The book will be reserved for the student for three days after its immediate availability. After the reserve period the book goes to the general pool and the hold becomes void.",
];

const guidelines = [
  "Identity card is a must for entering the Library and using the Library facilities.",
  "All readers must sign the gate register kept at the entry point of the Library.",
  "Maintain silence in the Library.",
  "Do not displace books in racks. Each book has a designated location.",
  "Members shall not engage in conversation in any part of the Library, so as to avoid disturbance to other readers.",
  "Members shall not write upon, damage or mark any book belonging to the Central Library.",
  "Members are responsible for any damage caused by them to books or any other property belonging to the Central Library.",
  "Members leaving the Library shall stop at the exit point so that materials borrowed or taken out of the Library can be checked.",
  "Members caught tearing pages or stealing books will be suspended forthwith from Central Library facilities, and further disciplinary action will be initiated by the college authority.",
];

const committee = [
  { name: "Dr. V.S.S. Murthy", dept: "ME", desig: "Principal", role: "Chairman" },
  { name: "Smt. L. Sasikala", dept: "Library", desig: "Librarian", role: "Convener" },
  { name: "Sri. P. Pavan Kumar", dept: "CE", desig: "Assistant Professor", role: "Member" },
  { name: "Dr. C. Kumar Reddy", dept: "EEE", desig: "Associate Professor", role: "Member" },
  { name: "Sri. D. Merwin Rajesh", dept: "Mechanical", desig: "Assistant Professor", role: "Member" },
  { name: "Miss. S. Jabeen", dept: "ECE", desig: "Assistant Professor", role: "Member" },
  { name: "Miss. T. Anitha", dept: "CSE", desig: "Assistant Professor", role: "Member" },
  { name: "Sri. D. Mallikarjun Reddy", dept: "H&S", desig: "Assistant Professor", role: "Member" },
];

const practices = [
  {
    title: "Book Selection & Procurement",
    body: "Books and journals are recommended by faculty using selection tools such as Books in Print, trade catalogues and publishers' catalogues, with the decision taken by the Library Committee and the Librarian. For general and reference books, students may recommend titles to the Librarian. Orders are then placed with approved vendors.",
  },
  {
    title: "Classification Scheme",
    body: "The Library has adopted the Dewey Decimal Classification (DDC 22nd edition) scheme, which is widely recognised by the AICTE.",
  },
  {
    title: "Locating Documents",
    body: "Books are arranged according to call numbers on the shelves. The OPAC facility assists users and faculty in locating books - the database can be searched by Author, Title, Accession Number and Publisher.",
  },
  {
    title: "Arrangement of Books",
    body: "The Library follows an open system. Books are arranged as Text Books (for issue) and Reference Books (for reading only). Acquired books are accessioned and classified, and newly procured titles are displayed within 15 days.",
  },
  {
    title: "Magazines & Newspapers",
    body: "The Library receives 22 magazines and 11 newspapers, along with Employment News and Assignment Abroad Times, which provide the latest information on job opportunities to the user community.",
  },
  {
    title: "Current Periodicals",
    body: "The Library subscribes to about 32 national periodicals and magazines, displayed branch-wise on separate racks. The latest issue is displayed on the rack with back volumes kept beneath. Bulletins and newsletters received on gratis or exchange from other organisations and libraries are arranged separately.",
  },
  {
    title: "Back Volumes of Periodicals",
    body: "Loose issues of periodicals are withdrawn for binding as soon as a volume is complete. These bound volumes are arranged systematically in the reference section - about 250 back volumes of journals across different branches.",
  },
  {
    title: "Reference Service",
    body: "The Reference Section holds subject books, dictionaries, handbooks and current technical information for in-library consultation.",
  },
];

const journalTotals = journals.reduce(
  (a, j) => ({ national: a.national + j.national, international: a.international + j.international }),
  { national: 0, international: 0 },
);

export default function LibraryPage() {
  return (
    <CmsTextProvider section="library">
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

        .lib-h2 { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.7rem, 3vw, 2.4rem); font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
        .lib-lead { color: #666; font-size: 15.5px; margin: 0 0 32px; max-width: 780px; line-height: 1.7; }

        .lib-stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 28px; }
        .lib-stat-item { display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; }
        .lib-stat-icon { width: 48px; height: 48px; background: rgba(255,230,25,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .lib-stat-number { font-family: 'Rajdhani', sans-serif; font-size: 28px; font-weight: 700; color: #D4A500; }
        .lib-stat-label { font-size: 13.5px; color: rgba(255,255,255,0.85); text-transform: uppercase; letter-spacing: 0.5px; }

        .lib-vm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
        .lib-vm-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 28px; }
        .lib-vm-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; color: #2B3490; margin: 0 0 12px; }
        .lib-vm-card p { color: #555; font-size: 15px; line-height: 1.75; margin: 0; }
        .lib-goals { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .lib-goals li { color: #555; font-size: 14.5px; line-height: 1.6; padding-left: 26px; position: relative; }
        .lib-goals li::before { content: '▸'; position: absolute; left: 6px; color: #D4A500; font-weight: 700; }

        .lib-service-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .lib-service-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 12px; }
        .lib-service-icon { width: 44px; height: 44px; background: #eef1ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 19px; }
        .lib-service-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0; }
        .lib-service-card p { color: #555; font-size: 14.5px; line-height: 1.6; margin: 0; }

        /* Tables scroll inside their own box so a narrow phone never scrolls the page sideways. */
        .lib-table-wrap { overflow-x: auto; border: 1px solid #eef0f3; border-radius: 12px; background: #fff; }
        .lib-table { width: 100%; border-collapse: collapse; min-width: 460px; }
        .lib-table th { background: #2B3490; color: #fff; font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; text-align: left; padding: 13px 18px; letter-spacing: .4px; }
        .lib-table td { padding: 12px 18px; font-size: 14.5px; color: #444; border-top: 1px solid #eef0f3; }
        .lib-table tbody tr:nth-child(even) td { background: #fafbfc; }
        .lib-table tfoot td { background: #f4f3ef; font-weight: 700; color: #1a1a2e; border-top: 2px solid #2B3490; }
        .lib-table .num { text-align: right; font-variant-numeric: tabular-nums; }

        .lib-two-col { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 28px; align-items: start; }

        .lib-floor-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; }
        .lib-floor-card { background: #fff; border: 1px solid #eef0f3; border-top: 4px solid #2B3490; border-radius: 10px; padding: 22px; }
        .lib-floor-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #2B3490; margin: 0 0 12px; letter-spacing: .5px; text-transform: uppercase; }
        .lib-floor-card ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .lib-floor-card li { color: #555; font-size: 14.5px; padding-left: 18px; position: relative; }
        .lib-floor-card li::before { content: '•'; position: absolute; left: 4px; color: #D4A500; }

        .lib-eresources-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .lib-eresource-card { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 22px; display: flex; flex-direction: column; gap: 10px; }
        .lib-eresource-card h4 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #2B3490; margin: 0; }
        .lib-eresource-card p { color: #555; font-size: 14.5px; line-height: 1.6; margin: 0; }
        .lib-eresource-link { display: inline-flex; align-items: center; gap: 6px; color: #2B3490; font-size: 13px; font-weight: 700; text-decoration: none; width: fit-content; }

        .lib-chip-wrap { display: flex; flex-wrap: wrap; gap: 10px; }
        .lib-chip { background: #fff; border: 1px solid #e3e6ec; border-radius: 22px; padding: 9px 18px; font-size: 14px; color: #333; }

        .lib-rules { display: flex; flex-direction: column; gap: 12px; }
        .lib-rule { background: #fff; border-left: 4px solid #2B3490; padding: 15px 20px; border-radius: 4px; font-size: 14.5px; color: #555; line-height: 1.65; }
        .lib-rule.alt { border-left-color: #D4A500; }

        .lib-practice-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(330px, 1fr)); gap: 20px; }
        .lib-practice { background: #fff; border: 1px solid #eef0f3; border-radius: 12px; padding: 24px; }
        .lib-practice h3 { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 10px; }
        .lib-practice p { color: #555; font-size: 14.5px; line-height: 1.7; margin: 0; }

        .lib-librarian { display: grid; grid-template-columns: 240px 1fr; gap: 32px; background: #fff; border: 1px solid #eef0f3; border-radius: 14px; padding: 32px; align-items: start; }
        .lib-librarian-photo { width: 100%; aspect-ratio: 3 / 3.6; border-radius: 12px; overflow: hidden; background: linear-gradient(135deg, #2B3490, #1e2570); }
        .lib-librarian-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .lib-librarian dl { display: grid; grid-template-columns: 210px 1fr; gap: 0; margin: 18px 0 0; }
        .lib-librarian dt { font-size: 13.5px; font-weight: 700; color: #2B3490; padding: 10px 0; border-top: 1px solid #eef0f3; }
        .lib-librarian dd { font-size: 14.5px; color: #444; margin: 0; padding: 10px 0; border-top: 1px solid #eef0f3; line-height: 1.6; }
        @media (max-width: 760px) {
          .lib-librarian { grid-template-columns: 1fr; gap: 22px; padding: 22px; }
          .lib-librarian-photo { max-width: 200px; }
          .lib-librarian dl { grid-template-columns: 1fr; }
          .lib-librarian dd { padding-top: 0; border-top: none; }
        }

        .lib-video-grid { display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 1000px; margin: 0 auto; }
        .lib-video-wrap { border-radius: 10px; overflow: hidden; }
        .lib-video-wrap video { width: 100%; aspect-ratio: 16 / 9; object-fit: cover; display: block; }

        .lib-contact-card { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); border-radius: 12px; padding: 40px; color: #fff; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 32px; }
        .lib-contact-item { display: flex; flex-direction: column; gap: 10px; }
        .lib-contact-item-icon { width: 46px; height: 46px; background: rgba(255,230,25,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 19px; }
        .lib-contact-item h4 { font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #D4A500; margin: 0; }
        .lib-contact-item p { font-size: 15.5px; margin: 0; line-height: 1.6; }
        .lib-contact-item a { color: #D4A500; text-decoration: none; }
      `}</style>

      <section className="lib-hero">
        <div className="responsive-container">
          <div className="lib-eyebrow" style={{ marginBottom: 16 }}>Campus Life</div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}><CmsText section="library" slot="hero.title" /></h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 700 }}><CmsText section="library" slot="hero.subtitle" /></p>
        </div>
      </section>

      {/* About */}
      <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <div style={{ maxWidth: 900 }}>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.85, margin: 0 }}>
              <CmsText section="library" slot="about.p1" multiline />
            </p>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.85, margin: "18px 0 0" }}>
              <CmsText section="library" slot="about.p2" multiline />
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: "36px 0", background: "#2B3490" }}>
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

      {/* Vision, Mission, Goals */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="lib-h2">Vision, Mission &amp; Goals</h2>
          <p className="lib-lead">What the Central Library sets out to be, and how it gets there.</p>
          <div className="lib-vm-grid">
            <div className="lib-vm-card">
              <h3>Vision</h3>
              <p><CmsText section="library" slot="vision.text" multiline /></p>
            </div>
            <div className="lib-vm-card">
              <h3>Mission</h3>
              <p><CmsText section="library" slot="mission.text" multiline /></p>
            </div>
            <div className="lib-vm-card">
              <h3>Goals</h3>
              <ul className="lib-goals">
                {goals.map((g) => <li key={g}>{g}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tour video */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="lib-h2"><CmsText section="library" slot="tour.heading" /></h2>
          <p className="lib-lead"><CmsText section="library" slot="tour.lead" /></p>
          <CmsVideos
            section="library"
            fallback={["/videos/central-library.mp4"]}
            gridClassName="lib-video-grid"
            itemClassName="lib-video-wrap"
          />
        </div>
      </section>

      {/* Services */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="lib-h2"><CmsText section="library" slot="services.heading" /></h2>
          <p className="lib-lead"><CmsText section="library" slot="services.lead" /></p>
          <div className="lib-service-grid">
            {services.map((s) => (
              <div className="lib-service-card" key={s.title}>
                <div className="lib-service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seating + reprographics */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="lib-h2">Seating &amp; Facilities</h2>
          <p className="lib-lead">The Library seats 300 users at a time across four sections.</p>
          <div className="lib-two-col">
            <div>
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "0 0 14px" }}>Seating Capacity</h3>
              <div className="lib-table-wrap">
                <table className="lib-table">
                  <thead>
                    <tr><th>Section</th><th className="num">Seating Capacity</th></tr>
                  </thead>
                  <tbody>
                    {seating.map((s) => (
                      <tr key={s.section}><td>{s.section}</td><td className="num">{s.capacity}</td></tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr><td>Total</td><td className="num">300</td></tr>
                  </tfoot>
                </table>
              </div>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "0 0 14px" }}>Reprographic Facilities</h3>
              <div className="lib-table-wrap">
                <table className="lib-table">
                  <thead>
                    <tr><th>Equipment</th><th className="num">Quantity</th></tr>
                  </thead>
                  <tbody>
                    {reprographics.map((r) => (
                      <tr key={r.item}><td>{r.item}</td><td className="num">{r.count}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floor plan */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="lib-h2">What is on Each Floor</h2>
          <p className="lib-lead">The Central Library is spread over three floors.</p>
          <div className="lib-floor-grid">
            {floors.map((f) => (
              <div className="lib-floor-card" key={f.floor}>
                <h3>{f.floor}</h3>
                <ul>{f.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="lib-h2">Collections</h2>
          <p className="lib-lead">Department-wise holdings, journal subscriptions and other collections.</p>

          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "0 0 14px" }}>Books by Department</h3>
          <div className="lib-table-wrap">
            <table className="lib-table">
              <thead>
                <tr><th>Branch</th><th className="num">Volumes</th><th className="num">Titles</th></tr>
              </thead>
              <tbody>
                {holdings.map((h) => (
                  <tr key={h.branch}><td>{h.branch}</td><td className="num">{h.volumes}</td><td className="num">{h.titles}</td></tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td>Total</td><td className="num">65,384</td><td className="num">11,200</td></tr>
              </tfoot>
            </table>
          </div>

          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "36px 0 14px" }}>Journals Subscribed</h3>
          <div className="lib-table-wrap">
            <table className="lib-table">
              <thead>
                <tr><th>Branch</th><th className="num">National</th><th className="num">International</th></tr>
              </thead>
              <tbody>
                {journals.map((j) => (
                  <tr key={j.branch}><td>{j.branch}</td><td className="num">{j.national}</td><td className="num">{j.international}</td></tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td>Total</td><td className="num">{journalTotals.national}</td><td className="num">{journalTotals.international}</td></tr>
              </tfoot>
            </table>
          </div>

          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "36px 0 14px" }}>Videos, Discs &amp; Back Volumes</h3>
          <div className="lib-table-wrap">
            <table className="lib-table">
              <thead>
                <tr><th>Title</th><th className="num">Total Number</th></tr>
              </thead>
              <tbody>
                {otherHoldings.map((o) => (
                  <tr key={o.title}><td>{o.title}</td><td className="num">{o.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Digital library / e-resources */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="lib-h2">Digital Library &amp; E-Resources</h2>
          <p className="lib-lead">
            The Digital Library has 20 systems with internet access. Through institutional memberships and consortia,
            users can reach the following electronic resources.
          </p>
          <div className="lib-eresources-grid">
            {eresources.map((e) => (
              <div className="lib-eresource-card" key={e.title}>
                <h4>{e.title}</h4>
                <p>{e.desc}</p>
                {e.href && (
                  <a href={e.href} className="lib-eresource-link" target="_blank" rel="noopener noreferrer">Access Resource →</a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OPAC */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="lib-h2">OPAC &amp; Newspapers</h2>
          <div className="lib-two-col">
            <div>
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "0 0 12px" }}>
                Online Public Access Catalogue
              </h3>
              <p style={{ color: "#555", fontSize: 15, lineHeight: 1.8, margin: 0 }}>
                The Central Library provides two dedicated computers close to the circulation counter for searching the
                online database of our collections through E-CAP (Engineering College Automation Package) software.
                Users can search for documents by Author, Title, Subject and Publisher.
              </p>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "0 0 12px" }}>
                Newspapers Received
              </h3>
              <div className="lib-chip-wrap">
                {newspapers.map((n) => <span className="lib-chip" key={n}>{n}</span>)}
              </div>
              <p style={{ color: "#777", fontSize: 14, lineHeight: 1.7, margin: "16px 0 0" }}>
                Along with 22 magazines, Employment News and Assignment Abroad Times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Practices */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="lib-h2">How the Library Works</h2>
          <p className="lib-lead">Procurement, classification and the day-to-day running of the collection.</p>
          <div className="lib-practice-grid">
            {practices.map((p) => (
              <div className="lib-practice" key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Librarian */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="lib-h2">Librarian</h2>
          <p className="lib-lead">Profile of the Librarian, Central Library.</p>
          <div className="lib-librarian">
            <div>
              <div className="lib-librarian-photo">
                {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
                <img src="/library/ravi.jpg" alt="Dr. N. Ravisankar Reddy, Librarian" />
              </div>
            </div>
            <div>
              <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                Dr. N. Ravisankar Reddy, Ph.D
              </h3>
              <p style={{ color: "#2B3490", fontSize: 15, fontWeight: 600, margin: "4px 0 0" }}>Librarian</p>
              <dl>
                <dt>Educational Qualifications</dt>
                <dd>M.A., B.Ed., M.L.I.Sc., Ph.D</dd>
                <dt>Area of Specialisation</dt>
                <dd>Digital Resources</dd>
                <dt>Work Experience</dt>
                <dd>16 years</dd>
                <dt>Date of Joining K.S.R.M.C.E.</dt>
                <dd>09 October 2010</dd>
                <dt>Previous Experience</dt>
                <dd>
                  Teacher, Mangalakara Children&apos;s Home Education Centre, Puttaparthi (2004&ndash;2009);
                  Loyola Master of Computer Science &amp; Applications, Pulivendula (2009&ndash;2010)
                </dd>
                <dt>Publications</dt>
                <dd>12 articles in national and international conferences; 5 workshops; 6 seminars</dd>
                <dt>Contact</dt>
                <dd>
                  <a href="tel:+919441373732" style={{ color: "#2B3490", textDecoration: "none" }}>94413 73732</a>
                  {" · "}
                  <a href="mailto:library@ksrmce.ac.in" style={{ color: "#2B3490", textDecoration: "none" }}>library@ksrmce.ac.in</a>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Staff - CMS driven */}
      <LibraryStaff />

      {/* Committee */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="lib-h2">Central Library Committee</h2>
          <p className="lib-lead">The committee that oversees acquisitions and library policy.</p>
          <div className="lib-table-wrap">
            <table className="lib-table">
              <thead>
                <tr><th>S. No.</th><th>Name</th><th>Department</th><th>Designation</th><th>Role</th></tr>
              </thead>
              <tbody>
                {committee.map((c, i) => (
                  <tr key={c.name}>
                    <td>{String(i + 1).padStart(2, "0")}</td>
                    <td>{c.name}</td>
                    <td>{c.dept}</td>
                    <td>{c.desig}</td>
                    <td>{c.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Rules */}
      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="lib-h2">Rules &amp; Regulations</h2>
          <p className="lib-lead">Membership, borrowing and conduct inside the Library.</p>

          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "0 0 14px" }}>Borrowing Rules</h3>
          <div className="lib-rules">
            {rules.map((r, i) => (
              <div className="lib-rule" key={r}><strong>{i + 1}.</strong> {r}</div>
            ))}
          </div>

          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: "#2B3490", margin: "36px 0 14px" }}>General Guidelines</h3>
          <div className="lib-rules">
            {guidelines.map((g, i) => (
              <div className="lib-rule alt" key={g}><strong>{i + 1}.</strong> {g}</div>
            ))}
          </div>

          <div className="lib-two-col" style={{ marginTop: 36 }}>
            <div className="lib-practice">
              <h3>Loss of Books</h3>
              <p>
                If a library book is lost, the borrower has to submit a new book of the same title, author and
                publication. If not, the borrower has to pay as per the norms of the Library.
              </p>
            </div>
            <div className="lib-practice">
              <h3>Special Services</h3>
              <p>
                Photocopy facility is available on a payment basis at 50 paise per copy in the Central Library between
                09:00 am and 05:00 pm. A bibliographical search from the Central Library books database system is also
                available.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <div className="lib-contact-card">
            <div className="lib-contact-item">
              <div className="lib-contact-item-icon">📖</div>
              <h4>Librarian</h4>
              <p>Dr. N. Ravisankar Reddy, Ph.D</p>
            </div>
            <div className="lib-contact-item">
              <div className="lib-contact-item-icon">📞</div>
              <h4>Phone</h4>
              <p><a href="tel:+919441373732"><CmsText section="library" slot="contact.phone" /></a></p>
            </div>
            <div className="lib-contact-item">
              <div className="lib-contact-item-icon">✉️</div>
              <h4>Email</h4>
              <p><a href="mailto:library@ksrmce.ac.in"><CmsText section="library" slot="contact.email" /></a></p>
            </div>
            <div className="lib-contact-item">
              <div className="lib-contact-item-icon">🕐</div>
              <h4>Timings</h4>
              <p><CmsText section="library" slot="contact.timings" /></p>
            </div>
          </div>
        </div>
      </section>

      <PageResources section="library" hideVideos />
    </main>
    </CmsTextProvider>
  );
}
