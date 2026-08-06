"use client";

import Link from "next/link";
import CmsText, { usePageTextValue } from "@/components/CmsText";
import PageResources from "@/components/PageResources";
import PlacedCommittees from "@/components/committees/PlacedCommittees";
import { getGalleryPublic, GalleryImage } from "@/lib/gallery-api";
import { useLiveData } from "@/lib/use-live-data";

/**
 * KGCET - the Kandula Group Common Entrance Test.
 *
 * A group-wide scholarship scheme, so the content here is the same as the one
 * published on the sister college's site (klmcew.ac.in/KGCET.php) - one scheme
 * run by one management, not two.
 *
 * The year-wise figures are the only thing on this page that goes stale on a
 * schedule, so they sit in one array rather than being spread through the JSX.
 * The registration link and the enquiry number are Page Content fields: they
 * change every admission season, and neither should need a deployment.
 */

const PARTICIPATION = [
  { year: "2021", registered: 135, attended: 84, qualified: 52 },
  { year: "2022", registered: 492, attended: 221, qualified: 114 },
  { year: "2023", registered: 586, attended: 278, qualified: 178 },
  { year: "2024", registered: 741, attended: 327, qualified: 229 },
  { year: "2025", registered: 826, attended: 319, qualified: 211 },
  { year: "2026", registered: 672, attended: 339, qualified: 222 },
];

const HIGHLIGHTS = [
  { icon: "🎓", title: "Scholarships of ₹6,000 to ₹40,000", desc: "Awarded against B.Tech admission, on the rank secured in the test." },
  { icon: "🗓️", title: "Running since 2021", desc: "Conducted every year by the Kandula Group of Institutions." },
  { icon: "⚖️", title: "Merit, not means alone", desc: "Set up to widen access for deserving students who would struggle with fees." },
];

/**
 * Photographs from past KGCET events, carried across from the scheme's page on
 * the sister college's site.
 *
 * Only the event photographs. The three posters on that page each carry a
 * registration deadline that has passed - 30-04-2023, 14-06-2022, 30-04-2025 -
 * and one carries the sister college's phone numbers and a dead bit.ly
 * registration link. An expired deadline on the page whose job is to get
 * students to register would mislead them; a photograph of a past event does
 * not have that problem, provided it says which year it is from.
 */
const GALLERY = [
  { src: "/kgcet/joh03094.webp", caption: "KGCET & KGPGCET 2K24 results, at KSRMCE" },
  { src: "/kgcet/joh03099.webp", caption: "KGCET 2K22 — the top rank holder with her family, at KSRMCE" },
  { src: "/kgcet/joh03106.webp", caption: "A KGCET rank holder felicitated at KLM College of Engineering for Women, Orientation Day 2024" },
];

/**
 * The gallery: images routed to the KGCET page in the CMS, falling back to the
 * photographs above while none have been uploaded.
 *
 * So the college can replace these with its own - a current year's event, or
 * the current poster - without a code change, and the carried-across ones stop
 * showing the moment they do.
 */
function Gallery() {
  const uploaded = useLiveData<GalleryImage[]>(
    () => getGalleryPublic(undefined, undefined, "kgcet").catch(() => [] as GalleryImage[]),
    [],
  );
  const shots = (uploaded ?? []).length
    ? (uploaded ?? []).map((g) => ({ src: g.imageUrl, caption: g.title ?? "" }))
    : GALLERY;

  if (shots.length === 0) return null;

  return (
    <section style={{ padding: "64px 0", background: "#f4f3ef" }}>
      <div className="kg-container">
        <h2 className="kg-h2"><CmsText section="kgcet" slot="gallery-heading" /></h2>
        <div className="kg-gallery">
          {shots.map((g) => (
            <figure className="kg-shot" key={g.src}>
              {/* eslint-disable-next-line @next/next/no-img-element -- static asset / admin upload */}
              <img src={g.src} alt={g.caption} loading="lazy" />
              {g.caption && <figcaption>{g.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Rendered only once the college sets a link, so it is never a dead button. */
function RegisterButton() {
  const href = usePageTextValue("kgcet", "register.href").trim();
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="kg-cta">
      Register for KGCET →
    </a>
  );
}

function EnquiryPhone() {
  const raw = usePageTextValue("kgcet", "enquiry.phone").trim();
  if (!raw) return null;
  return (
    <a href={`tel:${raw.replace(/[^\d+]/g, "")}`} className="kg-phone">
      📞 {raw}
    </a>
  );
}

export default function KgcetPage() {
  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .kg-container { width: 100%; max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 768px) { .kg-container { padding: 0 20px; } }

        .kg-hero {
          position: relative;
          /* The 2K24 results photograph, darkened enough for the text to hold.
             It is the one page here with a photograph of its own subject. */
          background-image: linear-gradient(180deg, rgba(30,37,112,0.86) 0%, rgba(30,37,112,0.94) 100%), url('/kgcet/joh03094.webp');
          background-size: cover;
          background-position: center;
          background-color: #2B3490;
          color: #fff; padding: 72px 0;
        }
        .kg-hero h1 { font-family: 'Rajdhani', sans-serif; font-size: clamp(2rem, 4.5vw, 3.4rem); font-weight: 800; margin: 0 0 10px; line-height: 1.1; }
        .kg-hero .kg-sub { color: #FFE619; font-size: 18px; font-weight: 700; margin: 0 0 18px; }
        .kg-hero p { font-size: 16px; line-height: 1.8; margin: 0; max-width: 760px; color: rgba(255,255,255,0.92); }
        .kg-crumb { display: flex; gap: 8px; font-size: 14px; margin-bottom: 20px; }
        .kg-crumb a { color: #D4A500; text-decoration: none; }

        .kg-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .kg-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; padding: 28px; }
        .kg-card .kg-ico { font-size: 28px; margin-bottom: 12px; }
        .kg-card h3 { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #2B3490; margin: 0 0 8px; }
        .kg-card p { color: #555; font-size: 15px; line-height: 1.7; margin: 0; }

        .kg-h2 { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; color: #2B3490; margin: 0 0 28px; }

        .kg-table-wrap { overflow-x: auto; }
        .kg-table { width: 100%; border-collapse: collapse; font-size: 15px; min-width: 520px; }
        .kg-table th { background: #2B3490; color: #fff; padding: 14px; text-align: left; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: .5px; }
        .kg-table td { padding: 12px 14px; border-bottom: 1px solid #eef0f3; color: #555; }
        .kg-table tr:nth-child(even) td { background: #f4f3ef; }
        .kg-table td:first-child { font-weight: 700; color: #2B3490; }

        .kg-cta {
          display: inline-block; background: #c62828; color: #fff; padding: 15px 34px;
          border-radius: 8px; font-weight: 700; font-size: 16px; text-decoration: none;
          font-family: 'Rajdhani', sans-serif; transition: background .2s;
        }
        .kg-cta:hover { background: #b71c1c; }
        .kg-phone { display: inline-block; color: #2B3490; font-weight: 700; text-decoration: none; font-size: 16px; }

        .kg-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .kg-shot { margin: 0; background: #fff; border: 1px solid #eef0f3; border-radius: 12px; overflow: hidden; }
        .kg-shot img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; display: block; }
        /* Below the photo rather than over it: these captions name a year and a
           college, so they have to be readable, not decorative. */
        .kg-shot figcaption { padding: 14px 16px; font-size: 13.5px; line-height: 1.5; color: #555; }
        .kg-phone:hover { text-decoration: underline; }
      `}</style>

      <section className="kg-hero">
        <div className="kg-container">
          <div className="kg-crumb">
            <Link href="/">Home</Link><span>/</span>
            <Link href="/academics/fee-structure">Scholarships</Link><span>/</span>
            <span style={{ color: "rgba(255,255,255,0.75)" }}>KGCET</span>
          </div>
          <h1><CmsText section="kgcet" slot="heading" /></h1>
          <p className="kg-sub"><CmsText section="kgcet" slot="subheading" /></p>
          <p><CmsText section="kgcet" slot="intro" multiline /></p>
        </div>
      </section>

      <section style={{ padding: "64px 0" }}>
        <div className="kg-container">
          <div className="kg-grid">
            {HIGHLIGHTS.map((h, i) => (
              <div className="kg-card" key={h.title}>
                <div className="kg-ico">{h.icon}</div>
                <h3><CmsText section="kgcet" slot={`highlights.${i}.title`} /></h3>
                <p><CmsText section="kgcet" slot={`highlights.${i}.desc`} /></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 0", background: "#f4f3ef" }}>
        <div className="kg-container">
          <h2 className="kg-h2"><CmsText section="kgcet" slot="participation-heading" /></h2>
          <div className="kg-table-wrap">
            <table className="kg-table">
              <thead>
                <tr><th>Year</th><th>Registered</th><th>Attended</th><th>Qualified</th></tr>
              </thead>
              <tbody>
                {PARTICIPATION.map((r) => (
                  <tr key={r.year}>
                    <td>{r.year}</td>
                    <td>{r.registered.toLocaleString("en-IN")}</td>
                    <td>{r.attended.toLocaleString("en-IN")}</td>
                    <td>{r.qualified.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 0", textAlign: "center" }}>
        <div className="kg-container">
          <h2 className="kg-h2"><CmsText section="kgcet" slot="apply-heading" /></h2>
          <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, maxWidth: 700, margin: "0 auto 28px" }}>
            <CmsText section="kgcet" slot="apply-body" multiline />
          </p>
          <RegisterButton />
          <div style={{ marginTop: 24 }}><EnquiryPhone /></div>
        </div>
      </section>

      <Gallery />

      {/* The KGCET committee, if one is pointed at this page. */}
      <PlacedCommittees placement="KGCET" heading="KGCET Committee" />

      {/* Results, notifications and any other KGCET file, from Documents. */}
      <PageResources section="kgcet" />
    </main>
  );
}
