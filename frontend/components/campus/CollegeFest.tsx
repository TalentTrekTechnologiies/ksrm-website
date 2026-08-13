"use client";

import { resolveFileUrl } from "@/lib/api-base";
import { getEventsPublic, EventItem } from "@/lib/events-api";
import { useLiveData } from "@/lib/use-live-data";

/**
 * The college fest, on Campus Life.
 *
 * Driven by Admin -> Events: any event whose category is "Fest" (or whose
 * title says fest) appears here, so next year's fest is a CMS entry and not a
 * code change. The current fest is below as the built-in text, exactly as the
 * college announced it, and is replaced the moment a Fest event is added.
 *
 * Dates are formatted from the event's own eventDate/endDate rather than being
 * typed into the description, so a fest that runs over several days reads as a
 * range without anyone having to write one.
 */

const FALLBACK = {
  name: "KONNECT 2K26",
  kicker: "National-Level Techno-Cultural Fest",
  umbrella: "Part of SIVANANDA SMARANAM 2K26",
  blurb:
    "K.S.R.M. College of Engineering (Autonomous), Kadapa hosts KONNECT 2K26 alongside the KSNR Trophy 2K26, bringing together innovation, creativity and sportsmanship. Students from engineering colleges are warmly invited to take part.",
  strands: ["Technical Competitions", "Cultural Performances", "Sports Championships"],
  facts: [
    { label: "Total prize pool", value: "₹3,00,000" },
    { label: "KONNECT 2K26", value: "13 April 2026" },
    { label: "KSNR Trophy 2K26", value: "8 – 14 April 2026" },
    { label: "Convener", value: "Dr. Kumar Reddy Cheepati" },
    { label: "Venue", value: "K.S.R.M. College of Engineering, Kadapa" },
  ],
};

/** "2026-04-13" -> "13 April 2026"; a range collapses a shared month/year. */
function formatRange(start: string, end: string | null): string {
  const s = new Date(start);
  if (Number.isNaN(s.getTime())) return "";
  const fmt = (d: Date, withMonth = true, withYear = true) =>
    d.toLocaleDateString("en-GB", {
      day: "numeric",
      ...(withMonth ? { month: "long" as const } : {}),
      ...(withYear ? { year: "numeric" as const } : {}),
    });
  if (!end) return fmt(s);
  const e = new Date(end);
  if (Number.isNaN(e.getTime()) || e.getTime() === s.getTime()) return fmt(s);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  return sameMonth ? `${fmt(s, false, false)} – ${fmt(e)}` : `${fmt(s)} – ${fmt(e)}`;
}

export default function CollegeFest({
  /** null on the fest's own page, which already carries the heading. */
  heading = "College Fest",
}: {
  heading?: string | null;
} = {}) {
  const events = useLiveData<EventItem[]>(
    () => getEventsPublic().catch(() => [] as EventItem[]),
    [],
  );

  const fests = (events ?? []).filter(
    (e) => /fest/i.test(e.category ?? "") || /fest|konnect|trophy/i.test(e.title),
  );

  return (
    <section style={{ padding: "64px 0", background: "#F5EFE4" }}>
      <div style={{ width: "100%", maxWidth: 1760, margin: "0 auto", padding: "0 40px" }}>
        <style>{`
          .fest-card { background: #fff; border: 1px solid #eef0f3; border-left: 5px solid #D4A500; border-radius: 12px; padding: 32px; }
          .fest-card + .fest-card { margin-top: 20px; }
          .fest-kicker { font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #D4A500; }
          .fest-name { font-family: 'Rajdhani', sans-serif; font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800; color: #2B3490; margin: 6px 0 4px; }
          .fest-umbrella { font-size: 13.5px; color: #777; font-weight: 600; margin: 0 0 16px; }
          .fest-blurb { font-size: 15.5px; color: #555; line-height: 1.75; margin: 0 0 20px; max-width: 900px; }
          .fest-strands { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 22px; padding: 0; list-style: none; }
          .fest-strands li { background: #eef1ff; color: #2B3490; font-size: 13px; font-weight: 700; padding: 6px 14px; border-radius: 999px; }
          .fest-facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 16px; margin: 0; padding: 20px 0 0; border-top: 1px solid #eef0f3; }
          .fest-facts dt { font-size: 11.5px; font-weight: 700; letter-spacing: .6px; text-transform: uppercase; color: #999; }
          .fest-facts dd { margin: 4px 0 0; font-size: 15px; font-weight: 600; color: #1a1a2e; line-height: 1.5; }
          .fest-img { width: 100%; max-width: 420px; border-radius: 10px; margin-top: 20px; display: block; }
        `}</style>

        {heading && (
          <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 800, color: "#1a1a2e", margin: "0 0 24px" }}>
            {heading}
          </h2>
        )}

        {fests.length > 0 ? (
          fests.map((e) => (
            <div className="fest-card" key={e.id}>
              {e.category && <div className="fest-kicker">{e.category}</div>}
              <h3 className="fest-name">{e.title}</h3>
              {e.subtitle && <p className="fest-umbrella">{e.subtitle}</p>}
              {e.description && <p className="fest-blurb">{e.description}</p>}
              {e.tags.length > 0 && (
                <ul className="fest-strands">
                  {e.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              <dl className="fest-facts">
                <div>
                  <dt>Dates</dt>
                  <dd>{formatRange(e.eventDate, e.endDate)}</dd>
                </div>
                {e.location && (
                  <div>
                    <dt>Venue</dt>
                    <dd>{e.location}</dd>
                  </div>
                )}
                {e.prizePool && (
                  <div>
                    <dt>Total prize pool</dt>
                    <dd>{e.prizePool}</dd>
                  </div>
                )}
                {e.organizerName && (
                  <div>
                    <dt>Convener</dt>
                    <dd>{e.organizerName}</dd>
                  </div>
                )}
              </dl>
              {e.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element -- CMS-supplied
                <img className="fest-img" src={resolveFileUrl(e.imageUrl)} alt={e.title} loading="lazy" decoding="async" />
              )}
            </div>
          ))
        ) : (
          <div className="fest-card">
            <div className="fest-kicker">{FALLBACK.kicker}</div>
            <h3 className="fest-name">{FALLBACK.name}</h3>
            <p className="fest-umbrella">{FALLBACK.umbrella}</p>
            <p className="fest-blurb">{FALLBACK.blurb}</p>
            <ul className="fest-strands">
              {FALLBACK.strands.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <dl className="fest-facts">
              {FALLBACK.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
