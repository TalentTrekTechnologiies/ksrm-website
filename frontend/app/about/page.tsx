"use client"

import { mediaFile, resolveFileUrl } from "@/lib/api-base";
import PlacedCommittees from "@/components/committees/PlacedCommittees";
import NamedCommittees from "@/components/committees/NamedCommittees";
import Link from "next/link"
import { getDownloadsPublic, Download } from "@/lib/downloads-api";
import { useLiveData } from "@/lib/use-live-data";
import { LEADERSHIP } from "@/data/leadership"
import CmsText from "@/components/CmsText";
import PageResources from "@/components/PageResources";
import GoverningBody from "@/components/about/GoverningBody";

/** Group headings the About page's document sections are stored under, so an
 *  admin can add/remove documents in Page Content -> About and have them land
 *  in the right designed section rather than a generic list at the bottom. */
// The label 8 existing documents are already filed under, here and on the live
// site. It is a data key, not a caption - the heading and nav now read "Board
// of Studies", but renaming this would orphan every one of those documents.
const GROUP_JBOS = "Joint Board of Studies";
const GROUP_STRATEGIC = "Strategic Plan & Deployment Documents";
const GROUP_POLICY = "Policy Documents";

/** Managing Trustees of the charities. Names and roles are editable from
 *  Page Content -> About; this array only fixes how many rows render, the
 *  same indexed-slot approach the Accreditation page uses for its rankings. */
const TRUSTEES = [
  // Three of the six already have a portrait in the Leadership section - the
  // same people, so the same file rather than a second copy. The rest fall
  // back to their initials; a missing photo should read as deliberate, not
  // as a broken image.
  { name: "Sri. K. Madan Mohan Reddy", role: "President", photo: "/images/leadership/chairman.webp" },
  { name: "Smt. K. Rajeswari", role: "Vice-President & Treasurer", photo: "/images/leadership/correspondent.webp" },
  { name: "Sri. K. Chandra Obul Reddy", role: "Secretary", photo: "/images/leadership/managing-director.webp" },
  { name: "Sri. K. Raja Mohan Reddy", role: "Member", photo: "" },
  { name: "Sri. S. Venkata Siva Reddy", role: "Member", photo: "" },
  { name: "Sri. K. Murali Mohan Reddy", role: "Member", photo: "" },
];

/** "Sri. K. Madan Mohan Reddy" -> "MM". Honorifics and the single initial
 *  carry no meaning, so they are skipped in favour of the actual name. */
function trusteeInitials(name: string): string {
  const words = name
    .replace(/^(Sri\.?|Smt\.?|Dr\.?|Kum\.?)\s+/i, "")
    .split(/\s+/)
    .filter((w) => w.replace(/\./g, "").length > 1);
  return words.slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "K";
}

export default function About() {
  // CMS documents routed to this page. Each designed section below renders its
  // own group when the CMS has one, and falls back to the built-in list
  // otherwise - so the page is never empty, and anything added in Page Content
  // shows up in the matching section instead of a separate block.
  const cmsDocs = useLiveData<Download[]>(
    () => getDownloadsPublic(undefined, undefined, "about").catch(() => [] as Download[]),
    [],
  );
  const docsForGroup = (group: string, fallback: { title: string; url: string; icon: string }[]) => {
    const rows = (cmsDocs ?? []).filter((d) => (d.groupLabel ?? "").trim() === group);
    return rows.length > 0
      ? rows.map((d) => ({ title: d.title, url: resolveFileUrl(d.fileUrl), icon: "📄" }))
      : fallback;
  };

  const statsData = [
    { number: "45+", label: "Years of Excellence" },
    { number: "35.23", label: "Acres Campus" },
    { number: "27,864 sq.m", label: "Built-up Area" },
    { number: "1,000+", label: "Students Intake" },
    { number: "8", label: "Departments" },
    { number: "2", label: "Hostels" },
  ]

  const strategicDocs = [
    { title: "Strategic Plan 2023-28", url: mediaFile(163), icon: "📊" },
    { title: "Strategic Plan 2018-23", url: mediaFile(164), icon: "📊" },
    { title: "Organizational Procedure Manual", url: mediaFile(165), icon: "📋" },
    { title: "Student Hand Book", url: mediaFile(166), icon: "📚" },
    { title: "Principal Hand Book", url: mediaFile(167), icon: "📖" },
  ]

  const policyDocs = [
    { title: "Institution Core Values", url: mediaFile(168), icon: "🎯" },
    { title: "Code of Professional Conduct", url: mediaFile(169), icon: "📜" },
    { title: "Code of Conduct Handbook", url: mediaFile(170), icon: "📘" },
    { title: "Faculty Evaluation System", url: mediaFile(171), icon: "📈" },
    { title: "Code of Ethics in Research and Innovation", url: mediaFile(172), icon: "🔬" },
  ]

  // Empty on purpose. This held eight links to /demo1/JBoSMeeting/*.pdf,
  // every one of which now returns the site's own HTML shell with a 200 - the
  // files did not survive the move off the old site. A fallback whose whole
  // job is to keep the section populated is worse than an empty section when
  // every entry in it is dead: the visitor clicks and gets the homepage back.
  //
  // The section fills itself from Page Content -> About, group
  // "Joint Board of Studies", as soon as the PDFs are uploaded there.
  const jbosDocuments: { title: string; url: string; icon: string }[] = []


  return (
    <main style={{ backgroundColor: "#F5EFE4", fontFamily: "Arimo, Arial, Helvetica, sans-serif", color: "#1F2937" }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arimo, Arial, Helvetica, sans-serif; }
        .k-container { max-width: 1760px; margin: 0 auto; padding: 0 24px; }
        .k-section { padding: 72px 0; }
        h2 { color: #2B3490; font-size: 40.8px; font-weight: 700; margin-bottom: 48px; text-align: left; }
        h3 { color: #2B3490; font-size: 19px; font-weight: 700; }

        .k-hero { position: relative; background-image: url('/site-images/topview.webp'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 320px; padding: 80px 0; display: flex; align-items: center; color: white; overflow: hidden; }
        .k-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%); z-index: 1; }
        .k-hero-content { position: relative; z-index: 2; }
        .k-hero-content { }
        .k-hero-eyebrow { color: #D4A500; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
        .k-hero-title { font-size: 61.2px; font-weight: 700; margin-bottom: 8px; }
        .k-hero-subtitle { color: #D4A500; font-size: 19px; font-weight: 600; }

        .k-stats { background: white; border-top: 2px solid #D4A500; padding: 40px 0; }
        .k-stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 24px; text-align: center; }
        .k-stat-item { }
        .k-stat-number { color: #2B3490; font-size: clamp(19px, 5.1vw, 32px); font-weight: 700; font-family: Rajdhani; margin-bottom: 8px; }
        .k-stat-label { color: #666; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

        .k-vision-mission { background: white; }
        .k-vision-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px; }
        .k-vision-box { background: #F9F9F9; border: 1.6px solid #D4A500; border-radius: 8px; padding: 28px; }
        .k-mission-items { display: flex; flex-direction: column; gap: 16px; }
        .k-mission-item { background: #F4F3EF; border-radius: 8px; padding: 20px; position: relative; }
        .k-mission-badge { position: absolute; top: 12px; right: 12px; background: #2B3490; color: #D4A500; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 4px; }
        .k-mission-text { padding-top: 16px; color: #555; font-size: 15px; line-height: 1.7; }

        /* Trustees: a numbered name/role list, two columns on desktop so six
           short rows do not run as one thin strip down a very wide page. */
        /* Portrait cards rather than a two-column name/role list: the list
           left most of a very wide row empty to the right of each role, and
           the photos already exist for half of these people. */
        .k-trustees { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        /* Three fixed tracks rather than flex: with the role pushed to each
           card's right edge it landed at a different distance from every name,
           so the roles read as ragged instead of as a column. A fixed role
           track starts them all at the same x. */
        .k-trustee { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px; background: #fff; border: 1px solid #EADFC8; border-radius: 12px; padding: 24px 18px 20px; transition: box-shadow .18s, transform .18s; }
        .k-trustee:hover { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(43,52,144,.12); }
        .k-trustee-photo { width: 104px; height: 104px; border-radius: 50%; object-fit: cover; object-position: top center; border: 3px solid #fff; box-shadow: 0 0 0 2px #2B3490; margin-bottom: 12px; background: #F4F3EF; }
        /* Same circle as a real photo so a card without one keeps the row's rhythm. */
        .k-trustee-initials { display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #2B3490, #1e2570); color: #FFE619; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 30px; letter-spacing: 1px; }
        .k-trustee-name { color: #1a1a2e; font-weight: 700; font-size: 16px; font-family: 'Rajdhani', sans-serif; line-height: 1.3; }
        .k-trustee-role { color: #2B3490; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }

        .k-leadership { background: #F4F3EF; }
        /* Five cards. Four columns stranded the fifth alone on a second row. */
        .k-leadership-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 24px; align-items: stretch; }
        /* The cards used to be whatever height their bio made them, so the
           "View Profile" buttons sat at four different heights. The link is a
           flex item filling its grid cell, the card fills the link, and the
           button is pushed to the bottom - so every button lines up however
           long the text above it runs. */
        .k-leader-link { text-decoration: none; display: flex; height: 100%; }
        .k-leadership-card { background: white; border: 0.8px solid #E5E7EB; border-radius: 12px; padding: 28px; text-align: center; display: flex; flex-direction: column; width: 100%; }
        .k-leadership-card .k-leader-btn { margin-top: auto; }
        /* Clamp the summary so one long message can't make every card tall. */
        .k-leader-bio { display: -webkit-box; -webkit-line-clamp: 6; -webkit-box-orient: vertical; overflow: hidden; }
        .k-leader-photo { width: 120px; height: 120px; border: 4px solid #D4A500; border-radius: 50%; object-fit: cover; object-position: top center; background: #F4F3EF; margin: 0 auto 16px; display: block; }
        .k-leader-name { color: #2B3490; font-size: 18px; font-weight: 700; margin-bottom: 8px; }
        .k-leader-role { display: inline-block; background: #2B3490; color: white; font-size: 14px; font-weight: 600; padding: 3px 10px; border-radius: 4px; margin-bottom: 16px; }
        .k-charities-body { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 40px; align-items: stretch; }
        .k-charities-p { color: #555; font-size: 15.5px; line-height: 1.85; margin: 0 0 18px; text-align: justify; text-justify: inter-word; hyphens: auto; }
        .k-charities-figure { margin: 0; height: 100%; }
        .k-charities-figure img { width: 100%; height: 100%; min-height: 280px; object-fit: cover; object-position: top center; border-radius: 10px; border: 4px solid #fff; box-shadow: 0 8px 24px rgba(43,52,144,.16); background: #F4F3EF; display: block; }
        /* Portrait above the text once there is no room beside it. */
        @media (max-width: 900px) {
          .k-charities-body { grid-template-columns: 1fr; }
          .k-charities-figure { max-width: 260px; height: auto; margin: 0 auto 8px; order: -1; }
          .k-charities-p { text-align: left; }
        }
        .k-leader-bio { color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 16px; }
        .k-leader-btn { display: inline-block; background: #2B3490; color: #D4A500; padding: 10px 16px; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; cursor: pointer; }
        .k-leadership-card:hover .k-leader-btn { background: #D4A500; color: #2B3490; }

        .k-docs { background: white; }
        .k-docs-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .k-doc-card { background: white; border: 0.8px solid #DDD; border-radius: 8px; padding: 20px; display: flex; gap: 16px; align-items: flex-start; position: relative; transition: all 0.2s; }
        .k-doc-card:hover { border-color: #D4A500; box-shadow: 0 2px 8px rgba(212,165,0,0.1); }
        .k-doc-icon { font-size: 28px; min-width: 44px; height: 44px; background: #EEF1FF; border-radius: 6px; display: flex; align-items: center; justify-content: center; }
        .k-doc-content { flex: 1; }
        .k-doc-title { color: #2B3490; font-size: 15px; font-weight: 600; margin-bottom: 4px; }
        .k-doc-subtitle { color: #999; font-size: 13px; }
        .k-doc-link { position: absolute; top: 12px; right: 12px; color: #D4A500; font-size: 17px; }

        .k-contact { background: white; }
        .k-contact-subtitle { text-align: center; color: #999; font-size: 15px; margin-bottom: 32px; }
        .k-contact-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .k-contact-box { border-radius: 12px; padding: 32px; }
        .k-contact-find { background: linear-gradient(135deg, #2B3490 0%, #1A1D4D 100%); color: white; }
        .k-contact-find h3 { color: #D4A500; }
        .k-contact-other { background: #F9F9F9; border-radius: 12px; padding: 32px; }
        .k-contact-contact { border: 1.6px solid #D4A500; }
        .k-contact-contact h3 { color: #2B3490; }
        .k-contact-connect { border: 0.8px solid #E5E7EB; }
        .k-contact-connect h3 { color: #2B3490; }
        .k-contact-text { font-size: 15px; line-height: 1.8; margin-bottom: 12px; }
        .k-contact-link { color: #2B3490; text-decoration: none; transition: color 0.2s; }
        .k-contact-link:hover { color: #D4A500; }
        .k-social-links { display: flex; gap: 12px; margin-top: 16px; }
        .k-social-btn { display: inline-block; padding: 8px 14px; background: #2B3490; color: white; border-radius: 4px; font-size: 13px; font-weight: 600; text-decoration: none; transition: all 0.2s; }
        .k-social-btn:hover { background: #D4A500; color: #2B3490; }

        /* Five across needs the room; below it the cards get too narrow to
           read, so drop to three before the 1024 rule takes over at two. */
        @media (max-width: 1440px) {
          .k-leadership-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 1024px) {
          .k-stats-grid { grid-template-columns: repeat(3, 1fr); }
          .k-leadership-grid { grid-template-columns: repeat(2, 1fr); }
          .k-docs-grid { grid-template-columns: repeat(2, 1fr); }
          .k-contact-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          h2 { font-size: 28px; }
          .k-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .k-vision-grid { grid-template-columns: 1fr; }
          .k-leadership-grid { grid-template-columns: 1fr; }
          .k-docs-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* HERO BANNER */}
      <section className="k-hero" style={{ backgroundImage: "url('/banners/about.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="k-container">
          <div className="k-hero-content">
            <div className="k-hero-eyebrow">🏛️ ABOUT US</div>
            <h1 className="k-hero-title"><CmsText section="about" slot="k-s-r-m-college" /></h1>
            <div className="k-hero-subtitle">Excellence in Technical Education Since 1980</div>
          </div>
        </div>
      </section>

      {/* NAVIGATION MENU */}
      <style>{`
        .nav-menu { background: white; position: sticky; top: 0; z-index: 100; border-bottom: 1px solid #E5E7EB; }
        .nav-menu .k-container { display: flex; gap: 12px; padding: 16px 0; overflow-x: auto; align-items: center; }
        .nav-link { color: #666; text-decoration: none; font-weight: 600; font-size: 15px; padding: 10px 20px; border-radius: 20px; white-space: nowrap; transition: all 0.2s; }
        .nav-link:hover { color: #333; }
        .nav-link.active { background: #2B3490; color: white; }
      `}</style>

      <nav className="nav-menu">
        <div className="k-container">
          <a href="#stats" className="nav-link active" style={{ background: "#2B3490", color: "white" }}>About</a>
          <a href="#vision-mission" className="nav-link">Vision & Mission</a>
          <a href="#leadership" className="nav-link">Leadership</a>
          <a href="#jbos" className="nav-link">Board of Studies</a>
          <a href="#strategic" className="nav-link">Strategic Plan</a>
          <a href="#policies" className="nav-link">Policies</a>
          <a href="#contact" className="nav-link">Contact</a>
        </div>
      </nav>

      {/* STATS STRIP */}
      <section className="k-stats" id="stats">
        <div className="k-container">
          <div className="k-stats-grid">
            {statsData.map((stat, i) => (
              <div key={i} className="k-stat-item">
                <div className="k-stat-number">{stat.number}</div>
                <div className="k-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION & MISSION */}
      <section className="k-section k-vision-mission" id="vision-mission">
        <div className="k-container">
          <h2><CmsText section="about" slot="vision-mission" /></h2>
          <div className="k-vision-grid">
            <div>
              <h3 style={{ marginBottom: "16px" }}><CmsText section="about" slot="our-vision" /></h3>
              <div className="k-vision-box">
                <p style={{ color: "#555", fontSize: "15px", lineHeight: "1.7" }}><CmsText section="about" slot="to-evolve-as-center-of" multiline /></p>
              </div>
            </div>
            <div>
              <h3 style={{ marginBottom: "16px" }}><CmsText section="about" slot="our-mission" /></h3>
              <div className="k-mission-items">
                <div className="k-mission-item">
                  <div className="k-mission-badge">M1</div>
                  <div className="k-mission-text">To provide high quality education with enriched curriculum blended with impactful teaching-learning practices.</div>
                </div>
                <div className="k-mission-item">
                  <div className="k-mission-badge">M2</div>
                  <div className="k-mission-text">To promote research, entrepreneurship and innovation through industry collaborations.</div>
                </div>
                <div className="k-mission-item">
                  <div className="k-mission-badge">M3</div>
                  <div className="k-mission-text">To produce highly competent professional leaders for contributing to Socio-economic development of region and the nation.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SRI KANDULA OBULA REDDY CHARITIES — the founding trust. Sits before
          Leadership so the institution's origin and its trustees introduce the
          people who lead it, rather than following them. */}
      <section className="k-section" id="charities" style={{ background: "#F5EFE4" }}>
        <div className="k-container">
          <h2><CmsText section="about" slot="charities.heading" /></h2>
          {/* Prose left, portrait right. Justified so the two long paragraphs
              form a clean block against the image edge rather than a ragged one. */}
          <div className="k-charities-body">
            <div>
              <p className="k-charities-p"><CmsText section="about" slot="charities.p1" multiline /></p>
              <p className="k-charities-p" style={{ marginBottom: 28 }}>
                <CmsText section="about" slot="charities.p2" multiline />
              </p>
            </div>
            <figure className="k-charities-figure">
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset */}
              <img src="/images/leadership/correspondent.webp" alt="Smt. K. Rajeswari, Correspondent" />
            </figure>
          </div>

          <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "20px", fontWeight: 700, color: "#2B3490", margin: "0 0 16px" }}>
            <CmsText section="about" slot="charities.trusteesHeading" />
          </h3>
          <div className="k-trustees">
            {TRUSTEES.map((t, i) => (
              <div key={i} className="k-trustee">
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static asset, same as the Leadership cards
                  <img src={t.photo} alt={t.name} className="k-trustee-photo" />
                ) : (
                  <span className="k-trustee-photo k-trustee-initials">{trusteeInitials(t.name)}</span>
                )}
                <span className="k-trustee-name"><CmsText section="about" slot={`trustees.${i}.name`} /></span>
                <span className="k-trustee-role"><CmsText section="about" slot={`trustees.${i}.role`} /></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GOVERNING BODY — entirely CMS-driven (Admin -> Committees, type
          "Governing Body"). Renders nothing until members are added. */}
      <GoverningBody />

      {/* LEADERSHIP */}
      <section className="k-section k-leadership" id="leadership">
        <div className="k-container">
          <h2><CmsText section="about" slot="leadership" /></h2>
          <div className="k-leadership-grid">
            {LEADERSHIP.map((leader, i) => (
              <Link key={i} href={`/about/${leader.slug}`} className="k-leader-link">
                <div className="k-leadership-card" style={{ cursor: "pointer" }}>
                  <img src={leader.photo} alt={leader.name} className="k-leader-photo" />
                  <div className="k-leader-name">{leader.name}</div>
                  <div className="k-leader-role">{leader.role}</div>
                  <div className="k-leader-bio">{leader.paragraphs[0]}</div>
                  <div className="k-leader-btn">View Profile →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ACADEMIC COUNCIL and FINANCE COMMITTEE — moved here from the IQAC
          page, where they sat behind an "Apex Bodies" tab. Both are ordinary
          CMS committees (Admin -> Committees), matched by name. */}
      <NamedCommittees names={["Academic Council", "Finance Committee"]} background="#F5EFE4" />

      {/* BOARD OF STUDIES */}
      <section className="k-section k-docs" id="jbos">
        <div className="k-container">
          <h2><CmsText section="about" slot="joint-board-of-studies" /></h2>
          <div className="k-docs-grid">
            {docsForGroup(GROUP_JBOS, jbosDocuments).length === 0 && (
              <p style={{ color: "#666", fontSize: 15, fontStyle: "italic", gridColumn: "1 / -1" }}>
                Board of Studies minutes will be published here shortly.
              </p>
            )}
            {docsForGroup(GROUP_JBOS, jbosDocuments).map((doc, i) => (
              <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div className="k-doc-card">
                  <div className="k-doc-icon">{doc.icon}</div>
                  <div className="k-doc-content">
                    <div className="k-doc-title">{doc.title}</div>
                    <div className="k-doc-subtitle">Download PDF →</div>
                  </div>
                  <div className="k-doc-link">↗</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* STRATEGIC PLAN & DEPLOYMENT DOCUMENTS */}
      <section className="k-section k-docs" id="strategic" style={{ background: "#F5EFE4" }}>
        <div className="k-container">
          <h2><CmsText section="about" slot="strategic-plan-deployment-documents" /></h2>
          <div className="k-docs-grid">
            {docsForGroup(GROUP_STRATEGIC, strategicDocs).map((doc, i) => (
              <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div className="k-doc-card">
                  <div className="k-doc-icon">{doc.icon}</div>
                  <div className="k-doc-content">
                    <div className="k-doc-title">{doc.title}</div>
                    <div className="k-doc-subtitle">Download PDF →</div>
                  </div>
                  <div className="k-doc-link">↗</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL POLICY DOCUMENTS */}
      <section className="k-section k-docs" id="policies">
        <div className="k-container">
          <h2><CmsText section="about" slot="institutional-policy-documents" /></h2>
          <div className="k-docs-grid">
            {docsForGroup(GROUP_POLICY, policyDocs).map((doc, i) => (
              <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
                <div className="k-doc-card">
                  <div className="k-doc-icon">{doc.icon}</div>
                  <div className="k-doc-content">
                    <div className="k-doc-title">{doc.title}</div>
                    <div className="k-doc-subtitle">Download PDF →</div>
                  </div>
                  <div className="k-doc-link">↗</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* GET IN TOUCH */}
      <section className="k-section k-contact" id="contact">
        <div className="k-container">
          <h2 style={{ textAlign: "center" }}><CmsText section="about" slot="get-in-touch" /></h2>
          <div style={{ textAlign: "center", marginBottom: "32px" }} className="k-contact-subtitle">
            EAPCET Code: K.S.R.M. | Affiliated to JNTUA | UGC Autonomous
          </div>
          <div className="k-contact-grid">
            <div className="k-contact-box k-contact-find">
              <h3><CmsText section="about" slot="find-us" /></h3>
              <div className="k-contact-text">K.S.R.M. College of Engineering, Kadapa – 516003, Andhra Pradesh, India.</div>
              <div className="k-contact-text" style={{ fontSize: "14px" }}>7 KM from Kadapa town on Kadapa–Pulivendula Highway.</div>
            </div>
            <div className="k-contact-box k-contact-other k-contact-contact">
              <h3><CmsText section="about" slot="contact-us" /></h3>
              <div className="k-contact-text"><a href="tel:+919000073434" className="k-contact-link">+91-9000073434</a></div>
              <div className="k-contact-text"><a href="tel:+918143731980" className="k-contact-link">+91-8143731980</a></div>
              <div className="k-contact-text"><a href="tel:+918562295972" className="k-contact-link">08562-295972</a></div>
              <div className="k-contact-text"><a href="mailto:ksrmcengg@yahoo.co.in" className="k-contact-link">ksrmcengg@yahoo.co.in</a></div>
              <div className="k-contact-text"><a href="mailto:principal@ksrmce.ac.in" className="k-contact-link">principal@ksrmce.ac.in</a></div>
            </div>
            <div className="k-contact-box k-contact-other k-contact-connect">
              <h3><CmsText section="about" slot="connect-with-us" /></h3>
              <div className="k-contact-text"><a href="https://www.ksrmce.ac.in" target="_blank" rel="noopener noreferrer" className="k-contact-link">www.ksrmce.ac.in</a></div>
              <div className="k-social-links">
                <a href="https://www.facebook.com/ksrmce" target="_blank" rel="noopener noreferrer" className="k-social-btn">Facebook</a>
                <a href="https://twitter.com/ksrmce" target="_blank" rel="noopener noreferrer" className="k-social-btn">Twitter</a>
                <a href="https://www.instagram.com/ksrmce" target="_blank" rel="noopener noreferrer" className="k-social-btn">Instagram</a>
                <a href="https://www.youtube.com/@ksrmceofficialmedia" target="_blank" rel="noopener noreferrer" className="k-social-btn">YouTube</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      {/* Any committee the CMS points at this page - see PlacedCommittees.
          Renders nothing until one is pointed here. */}
      <PlacedCommittees placement="ABOUT" heading="Committees" />

      </main>
  )
}
