"use client";

import { useState } from "react";

import CmsText, { usePageTextValue } from "@/components/CmsText";
import { getContactChannelsPublic, ContactChannel } from "@/lib/contact-channels-api";
import { getTransportRoutesPublic, TransportRoute } from "@/lib/transport-routes-api";
import { useLiveData } from "@/lib/use-live-data";
import PageResources from "@/components/PageResources";
const stats = [
  { icon: "🚌", value: "15", label: "Total Buses" },
  { icon: "📍", value: "8", label: "Routes" },
  { icon: "👥", value: "500+", label: "Students" },
  { icon: "🕐", value: "1,200+", label: "KM/Day" },
];

const routes = [
  { no: "R1", from: "Kadapa Railway Station", via: "Clock Tower → Tirupati Road → KSRMCE Gate", dep: "7:30 AM", ret: "5:30 PM", fee: "₹3,000/month" },
  { no: "R2", from: "Giddapalem", via: "Ambapuram → Piler Road → KSRMCE Gate", dep: "7:00 AM", ret: "6:00 PM", fee: "₹2,500/month" },
  { no: "R3", from: "Srikalahasthi", via: "Hayathnagar → Chandragiri Road → KSRMCE Gate", dep: "6:30 AM", ret: "5:00 PM", fee: "₹4,000/month" },
  { no: "R4", from: "Tirupati", via: "Arani → Kodur → KSRMCE Gate", dep: "6:00 AM", ret: "4:30 PM", fee: "₹4,500/month" },
  { no: "R5", from: "Naidupet", via: "Proddatur → Chakrayapet → KSRMCE Gate", dep: "7:15 AM", ret: "5:45 PM", fee: "₹3,500/month" },
  { no: "R6", from: "Rayachoti", via: "Jammalamadugu → Mydukur → KSRMCE Gate", dep: "6:45 AM", ret: "5:15 PM", fee: "₹3,800/month" },
  { no: "R7", from: "Chintachintala", via: "KSRMCE Gate", dep: "7:45 AM", ret: "5:00 PM", fee: "₹2,000/month" },
  { no: "R8", from: "Palamaner", via: "Madanapalle → Gangavalli → KSRMCE Gate", dep: "6:15 AM", ret: "4:45 PM", fee: "₹4,200/month" },
];

/**
 * One row of the built-in route list.
 *
 * A row whose "From" has been blanked in Page Content is dropped rather than
 * printed empty. The college publishes six routes and had cleared the last two
 * that way, which left two rows reading "R7"/"R8" against three empty cells -
 * emptying a field was the only way to remove a route, so it has to mean that.
 */
function FallbackRouteRow({
  route,
  index,
}: {
  route: { no: string; from: string; via: string; dep: string; ret: string };
  index: number;
}) {
  const from = usePageTextValue("transport", `routes.${index}.from`).trim();
  if (!from) return null;
  return (
    <tr>
      <td className="trn-route-no">{route.no}</td>
      <td>{from}</td>
      <td className="trn-via"><CmsText section="transport" slot={`routes.${index}.via`} /></td>
      <td>{route.dep}</td>
      <td>{route.ret}</td>
    </tr>
  );
}

const rules = [
  "Valid bus pass is mandatory for boarding. Display it clearly to the conductor.",
  "Be at the pickup point 5 minutes before departure. Buses do not wait beyond scheduled time.",
  "Maintain discipline and decorum inside the bus. No loud talking or creating disturbance.",
  "Eating and drinking (except water) are not permitted inside the bus.",
  "No smoking, vaping, or use of tobacco products inside the bus.",
  "Keep the bus clean. Do not litter or damage bus property.",
  "In case of emergency, immediately inform the driver or conductor.",
  "Drivers are authorized to enforce speed limits and safety protocols as per traffic rules.",
  "Misbehavior or misconduct may result in suspension of transport privileges.",
  "Bus pass should be renewed every semester. Late renewals may incur additional charges.",
];

const towns = ["Vempalli", "Yerraguntla", "Badvel", "Mydukur", "Proddutur", "Ontimitta", "Kadapa", "Rayachoti"];

/**
 * The people who actually run transport, as the college gave them.
 *
 * This card carried one number: "+91-8554-233333 (Ext: 330)". No phone can
 * dial an extension from a tel: link - tapping it reached the switchboard and
 * dropped the 330 - so the one contact the page offered did not work.
 *
 * Names are shown with the role, because a parent ringing about a bus route
 * wants to know who they are calling.
 */
const TRANSPORT_CONTACTS = [
  { role: "Transport In-charge", name: "Mr Siva Krishna Reddy", phone: "9160993030" },
  { role: "Advisor", name: "Mr Lakshumaiah", phone: "9160993050" },
  { role: "Supervisor", name: "Mr Bhavaji", phone: "9676236261" },
];

/** "9160993030" -> "+91 91609 93030" */
function pretty(p: string): string {
  const d = p.replace(/\D/g, "");
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : p;
}

export default function TransportPage() {
  // Contact rows named for transport in Admin -> Contacts take over when the
  // college adds them; until then the three above show. One place to edit,
  // and no code change when somebody moves on.
  const cms = useLiveData<ContactChannel[]>(
    () => getContactChannelsPublic().catch(() => [] as ContactChannel[]),
    [],
  );
  const fromCms = (cms ?? [])
    .filter((c) => /transport/i.test(c.name) && (c.phones ?? []).length)
    .map((c) => ({ role: c.name, name: "", phone: (c.phones ?? [])[0] }));
  const contacts = fromCms.length ? fromCms : TRANSPORT_CONTACTS;

  // Routes come from the CMS (Admin -> Transport), so adding a route, changing
  // a fee or assigning a driver needs no code change. The fetcher never
  // rejects: an unreachable API falls back to the built-in table below.
  const routesData = useLiveData<TransportRoute[]>(
    () => getTransportRoutesPublic().catch(() => [] as TransportRoute[]),
    [],
  );
  const cmsRoutes = routesData ?? [];

  // See the bike-parking section below: starts visible so a working video is
  // never hidden by a slow load, and switches off the moment it fails.
  const [bikeVideoOk, setBikeVideoOk] = useState(true);

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .trn-hero { position: relative; background-image: url('/banners/transport.webp'); background-size: cover; background-position: center; background-color: #2B3490; min-height: 280px; display: flex; align-items: flex-end; padding-bottom: 40px; overflow: hidden; }
        .trn-hero::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 100%; background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%); pointer-events: none; }
        .trn-hero > * { position: relative; z-index: 2; }
        .trn-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #D4A500; }
        .trn-breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 15px; color: rgba(255,255,255,0.7); margin-top: 24px; }
        .trn-breadcrumb a { color: #D4A500; text-decoration: none; }
        .trn-breadcrumb span { color: #D4A500; }
        .trn-stats-bar { background: #2B3490; padding: 32px 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 32px; }
        .trn-stat-item { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
        .trn-stat-icon { width: 48px; height: 48px; background: rgba(255,230,25,0.2); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
        .trn-stat-number { font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700; color: #D4A500; }
        .trn-stat-label { font-size: 14px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px; }
        .trn-table-wrapper { overflow-x: auto; margin-top: 40px; }
        .trn-table { width: 100%; border-collapse: collapse; font-size: 15px; }
        .trn-table thead th { background: #2B3490; color: #fff; padding: 14px; text-align: left; font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
        .trn-table tbody td { padding: 12px 14px; border-bottom: 1px solid #eef0f3; color: #555; }
        .trn-table tbody tr:nth-child(odd) { background: #f4f3ef; }
        .trn-table tbody tr:nth-child(even) { background: #ffffff; }
        .trn-route-no { font-family: 'Rajdhani', sans-serif; font-weight: 700; color: #2B3490; }
        .trn-via { font-size: 13px; color: #666; }
        .trn-rules { display: flex; flex-direction: column; gap: 12px; }
        .trn-rule { background: #f4f3ef; border-left: 4px solid #2B3490; padding: 14px 16px; border-radius: 4px; font-size: 14px; color: #555; line-height: 1.6; }
        .trn-contact-card { background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%); border-radius: 12px; padding: 40px; color: #fff; text-align: center; }
        .trn-contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px; margin-top: 32px; }
        .trn-contact-item h4 { font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #D4A500; margin: 0; }
        .trn-contact-item p { font-size: 15px; margin: 8px 0 0; line-height: 1.6; }
        .trn-contact-item a { color: #D4A500; text-decoration: none; }
        .trn-rules-container { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }
        .trn-rules-image { position: relative; height: 240px; border-radius: 12px; overflow: hidden; }
        .trn-rules-image img { width: 100%; height: 100%; object-fit: cover; }
        .trn-towns-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 12px; }
        .trn-town-card { background: #fff; border: 1.5px solid #2B3490; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; gap: 10px; }
        @media (max-width: 1024px) { .trn-rules-container { grid-template-columns: 1fr; gap: 32px; } }
      `}</style>

      <section className="trn-hero">
        <div className="responsive-container">
          <div className="trn-eyebrow" style={{ marginBottom: 16 }}>Campus Life</div>
          <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.7)" }}><CmsText section="transport" slot="transport" /></h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}><CmsText section="transport" slot="safe-reliable-campus-connectivity" /></p>
        </div>
      </section>

      <section style={{ padding: "56px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <div style={{ maxWidth: 820 }}>
            <p style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: 0 }}><CmsText section="transport" slot="k-s-r-m-college" multiline /></p>
          </div>
        </div>
      </section>

      <section style={{ padding: "40px 0", background: "#2B3490" }}>
        <div className="responsive-container">
          <div className="trn-stats-bar">
            {stats.map((s, _i) => (
              <div className="trn-stat-item" key={s.label}>
                <div className="trn-stat-icon">{s.icon}</div>
                <div className="trn-stat-number">{s.value}</div>
                <div className="trn-stat-label"><CmsText section="transport" slot={`stats.${_i}.label`} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}><CmsText section="transport" slot="bus-routes" /></h2>
          <div className="trn-table-wrapper">
            <table className="trn-table">
              {/* No Fee column, at the college's request. The fee is still
                  held per route in Admin -> Transport Routes - it is simply
                  not published here, so removing the column loses no data and
                  putting it back is one cell. */}
              <thead><tr><th>Route</th><th>From</th><th>Via (Stops)</th><th>Departure</th><th>Return</th></tr></thead>
              <tbody>
                {cmsRoutes.length > 0
                  ? cmsRoutes.map((r) => (
                      <tr key={r.id}>
                        <td className="trn-route-no">{r.routeNo}</td>
                        <td>{r.fromPlace}</td>
                        <td className="trn-via">{r.via || "—"}</td>
                        <td>{r.departTime || "—"}</td>
                        <td>{r.returnTime || "—"}</td>
                      </tr>
                    ))
                  : /* Only until routes are added in the CMS, or if the API is
                       unreachable - the table is never empty. */
                    routes.map((r, _i) => <FallbackRouteRow key={r.no} route={r} index={_i} />)}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 40px" }}><CmsText section="transport" slot="transport-rules" /></h2>
          <div className="trn-rules-container">
            <div className="trn-rules">
              {rules.map((r) => <div className="trn-rule" key={r}>{r}</div>)}
            </div>
            <div>
              <div className="trn-rules-image">
                <img src="/site-images/buses.webp" alt="K.S.R.M. college bus fleet" loading="lazy" decoding="async" />
              </div>
              <div style={{ marginTop: 16, padding: 16, background: "#f4f3ef", borderRadius: 8, borderLeft: "4px solid #2B3490" }}>
                <p style={{ margin: 0, fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                  <strong style={{ color: "#2B3490" }}>Modern Fleet:</strong> K.S.R.M. operates 15 buses covering 8 major
                  routes including Kadapa, Tirupati, and surrounding areas. All buses are equipped with GPS tracking
                  and air-conditioning for student safety and comfort.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f4f3ef" }}>
        <div className="responsive-container">
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", margin: "0 0 48px", textAlign: "center" }}><CmsText section="transport" slot="bus-routes-2" /></h2>
          <p style={{ textAlign: "center", fontSize: 16, color: "#555", marginBottom: 40 }}><CmsText section="transport" slot="college-transport-connects-campus-to" multiline /></p>
          <div className="trn-towns-grid">
            {towns.map((t) => (
              <div className="trn-town-card" key={t}>
                <span style={{ fontSize: 17, lineHeight: 1, flexShrink: 0 }}>📍</span>
                <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#2B3490", margin: 0, lineHeight: 1.25 }}>{t}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hidden entirely unless the video actually loads. The file is missing,
          and the static host answers an unknown path with the site's HTML
          shell under a 200 - so the browser gets HTML where it expected video
          and renders a blank black box under a heading. onError fires for
          exactly that case, so the section self-heals once a real file is
          uploaded, with no code change. */}
      {bikeVideoOk && (
        <section style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 700, color: "#2B3490", margin: "0 0 40px" }}><CmsText section="transport" slot="bike-parking-facility" /></h2>
            <div style={{ borderRadius: 8, overflow: "hidden", maxWidth: 1000, margin: "0 auto" }}>
              <video
                autoPlay
                loop
                muted
                playsInline
                onError={() => setBikeVideoOk(false)}
                style={{ width: "100%", aspectRatio: "16 / 9", objectFit: "cover", display: "block" }}
              >
                <source src="/videos/bike-parking.mp4" type="video/mp4" onError={() => setBikeVideoOk(false)} />
              </video>
            </div>
          </div>
        </section>
      )}

      <section style={{ padding: "72px 0", background: "#ffffff" }}>
        <div className="responsive-container">
          <div className="trn-contact-card">
            <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 24, fontWeight: 700, margin: 0 }}><CmsText section="transport" slot="transport-officer" /></h3>
            <div className="trn-contact-info">
              {contacts.map((c) => (
                <div className="trn-contact-item" key={c.phone}>
                  <h4>{c.role}</h4>
                  <p>
                    {c.name}
                    <br />
                    <a href={`tel:+91${c.phone.replace(/\D/g, "")}`}>{pretty(c.phone)}</a>
                  </p>
                </div>
              ))}
              <div className="trn-contact-item">
                <h4><CmsText section="transport" slot="email" /></h4>
                <p><a href="mailto:transport@ksrmce.ac.in">transport@ksrmce.ac.in</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PageResources section="transport" />
    </main>
  );
}
