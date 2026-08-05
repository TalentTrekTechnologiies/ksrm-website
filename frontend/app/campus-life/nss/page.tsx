"use client";

import PageResources from "@/components/PageResources";
import CmsText from "@/components/CmsText";
import { getGalleryPublic, GalleryImage } from "@/lib/gallery-api";
import { useLiveData } from "@/lib/use-live-data";

const aims = [
  "To understand the community in which they work",
  "To understand themselves in relation to their community",
  "To identify the needs and problems of the community and involve them in problem-solving",
  "To develop among themselves a sense of social and civic responsibility",
  "To utilise their knowledge in finding practical solutions to individual and community problems",
  "To develop competence required for group-living and sharing of responsibilities",
  "To gain skills in mobilizing community participation",
  "To acquire leadership qualities and democratic attitude",
  "To develop capacity to meet emergencies and natural disasters",
  "To practise national integration and social harmony",
];

const activities = [
  "Community awareness programs and health camps",
  "Environmental conservation drives and tree plantation",
  "Education support for underprivileged children",
  "Disaster relief and rehabilitation activities",
  "Social welfare programs and counseling",
  "NSS Day celebrations and cultural programs",
  "// activity details and photos from client",
];

/**
 * The NSS emblem.
 *
 * This block used to show an Om emoji - a religious symbol - directly above a
 * caption explaining that the NSS symbol is the Konark Rath wheel, so the
 * picture contradicted its own text.
 *
 * public/nss-logo.svg is the official emblem: the Ministry of Youth Affairs
 * and Sports artwork published on presentations.gov.in, the Government of
 * India identity portal, and in the public domain. Vector, so it stays sharp
 * at any size, and it carries the wordmark in both scripts - none of which a
 * crop from the page banner could give, that being a photograph with the
 * emblem small and angled on the volunteers' shirts.
 *
 * An image uploaded to the NSS page titled "logo", "symbol" or "emblem" takes
 * precedence, so the college can substitute its own unit's artwork without a
 * code change.
 */
function NssEmblem() {
  const images = useLiveData<GalleryImage[]>(
    () => getGalleryPublic(undefined, undefined, "nss").catch(() => [] as GalleryImage[]),
    [],
  );
  const uploaded = (images ?? []).find((g) => /logo|symbol|emblem/i.test(g.title ?? ""));

  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG asset / admin upload
    <img
      src={uploaded ? uploaded.imageUrl : "/nss-logo.svg"}
      alt="The NSS emblem: the Rath wheel of the Konark Sun Temple"
      style={{
        // Deliberately smaller than the column it sits in. At full width the
        // emblem outweighed the text beside it and the section read as a logo
        // with a note attached, rather than an explanation with a mark.
        width: "100%",
        maxWidth: 200,
        aspectRatio: "1",
        objectFit: "contain",
        margin: "0 auto",
        display: "block",
      }}
    />
  );
}

export default function NSSPage() {
  return (
    <main style={{ background: "#ffffff", overflowX: "hidden" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .nss-hero { position: relative; background-image: url('/banners/nss.png'); background-size: cover; background-position: center; background-color: #2B3490; min-height: 320px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .nss-hero::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%); z-index: 1; }
        .nss-hero > * { position: relative; z-index: 2; }
        .nss-title { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.2rem, 4.5vw, 3.6rem); font-weight: 700; color: #fff; margin: 0; text-shadow: 0 2px 12px rgba(0,0,0,0.7); line-height: 1.08; }
        .nss-subtitle { color: rgba(255,255,255,0.95); font-size: 19px; margin: 16px 0 0; text-shadow: 0 2px 8px rgba(0,0,0,0.6); font-weight: 400; }
        .nss-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; margin-top: 16px; text-shadow: 0 2px 8px rgba(0,0,0,0.6); }
        .nss-breadcrumb a { color: #D4A500; text-decoration: none; }
        .nss-breadcrumb span { color: rgba(255,255,255,0.7); }

        .nss-motto-section { padding: 72px 0; background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); text-align: center; }
        .nss-motto-quote { font-family: 'Rajdhani', sans-serif; font-size: clamp(2.4rem, 5vw, 4.2rem); font-weight: 700; color: #D4A500; margin: 0 0 24px; letter-spacing: 1px; }
        .nss-motto-desc { font-size: 17px; color: rgba(255,255,255,0.95); line-height: 1.8; max-width: 800px; margin: 0 auto; }

        .nss-history-text { font-size: 17px; color: #555; line-height: 1.8; text-align: justify; max-width: 900px; margin: 0 auto; }
        .nss-section-heading { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.8rem, 3vw, 2.4rem); font-weight: 700; color: #2B3490; margin: 0 0 48px; text-align: center; }

        .nss-aims-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
        .nss-aim-card { background: #fff; padding: 28px; border-radius: 8px; border-left: 4px solid #D4A500; box-shadow: 0 4px 20px rgba(43,52,144,0.08); }
        .nss-aim-number { font-family: 'Rajdhani', sans-serif; font-size: clamp(19px, 5.1vw, 32px); font-weight: 700; color: #D4A500; margin: 0 0 8px; }
        .nss-aim-text { font-size: 16px; color: #555; line-height: 1.7; margin: 0; }

        .nss-symbol-container { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .nss-symbol-image { text-align: center; }
        .nss-symbol-content h3 { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; color: #2B3490; margin: 0 0 16px; }
        .nss-symbol-content p { font-size: 17px; color: #555; line-height: 1.8; margin: 0; }

        .nss-activities-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin-top: 40px; }
        .nss-activity-item { background: #fff; padding: 24px; border-radius: 8px; border-top: 3px solid #D4A500; box-shadow: 0 4px 20px rgba(43,52,144,0.08); }
        .nss-activity-item h4 { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: #2B3490; margin: 0 0 8px; }
        .nss-activity-item p { font-size: 15px; color: #666; line-height: 1.6; margin: 0; }

        @media (max-width: 768px) {
          .nss-symbol-container { grid-template-columns: 1fr; gap: 32px; }
          .nss-aims-grid { grid-template-columns: 1fr; }
          .nss-activities-list { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="nss-hero">
        <div className="responsive-container">
          <h1 className="nss-title"><CmsText section="nss" slot="national-service-scheme-nss" /></h1>
          <p className="nss-subtitle"><CmsText section="nss" slot="empowering-youth-through-community-service" /></p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="nss-section-heading"><CmsText section="nss" slot="history-background" /></h2>
          <p className="nss-history-text"><CmsText section="nss" slot="national-service-scheme-nss-was" multiline /></p>
        </div>
      </section>

      <section className="nss-motto-section">
        <div className="responsive-container">
          <h2 className="nss-motto-quote"><CmsText section="nss" slot="not-me-but-you" /></h2>
          <p className="nss-motto-desc"><CmsText section="nss" slot="this-powerful-motto-embodies-the" multiline /></p>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="nss-section-heading"><CmsText section="nss" slot="aims-objectives" /></h2>
          <div className="nss-aims-grid">
            {aims.map((a, i) => (
              <div className="nss-aim-card" key={a}>
                <div className="nss-aim-number">{i + 1}</div>
                <p className="nss-aim-text">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 className="nss-section-heading"><CmsText section="nss" slot="nss-symbol" /></h2>
          <div className="nss-symbol-container">
            <div className="nss-symbol-image">
              <NssEmblem />
            </div>
            <div className="nss-symbol-content">
              <h3><CmsText section="nss" slot="nss-symbol-2" /></h3>
              <p><CmsText section="nss" slot="the-nss-symbol-is-based" multiline /></p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 className="nss-section-heading"><CmsText section="nss" slot="annual-activities-initiatives" /></h2>
          <p style={{ textAlign: "center", color: "#666", marginBottom: 40 }}><CmsText section="nss" slot="nss-at-ksrmce-conducts-regular" multiline /></p>
          <div className="nss-activities-list">
            {activities.map((a, i) => (
              <div className="nss-activity-item" key={a}>
                <h4>Activity {i + 1}</h4>
                <p>{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PageResources section="nss" />
    </main>
  );
}
