"use client";

import { getEventsPublic, EventItem } from "@/lib/events-api";
import { useLiveData } from "@/lib/use-live-data";
import PageResources from "@/components/PageResources";

export default function EventsPage() {
  // Polled, so an event published in the admin appears here without a refresh.
  // The fetcher never rejects, so a failed request resolves to [] and still
  // marks the page loaded - the empty state below covers it, same as before.
  const data = useLiveData<EventItem[]>(
    () => getEventsPublic().catch(() => [] as EventItem[]),
    [],
  );
  const events = data ?? [];
  const loaded = data !== null;

  return (
    <main style={{ background: "#ffffff" }}>
      <style>{`
        .responsive-container { max-width: 1760px; margin: 0 auto; padding: 0 40px; }
        @media (max-width: 1024px) { .responsive-container { padding: 0 32px; } }
        @media (max-width: 768px) { .responsive-container { padding: 0 20px; } }
        @media (max-width: 480px) { .responsive-container { padding: 0 14px; } }

        .evt-hero { position: relative; background-image: url('/images/campus/03.jpg'); background-size: cover; background-position: center; background-color: #f5f5f5; min-height: 320px; display: flex; align-items: flex-end; overflow: hidden; padding-bottom: 40px; }
        .evt-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.25) 100%); pointer-events: none; }
        .evt-hero > * { position: relative; z-index: 2; }
        .evt-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; margin: 32px 0; }
        .evt-card { background: #f7f8fa; border: 1px solid #eef0f3; border-radius: 12px; overflow: hidden; }
        .evt-card-image { width: 100%; height: 180px; background: #e5e7eb; }
        .evt-card-image img { width: 100%; height: 180px; object-fit: cover; display: block; }
        .evt-content { padding: 20px; }
        .evt-date { font-size: 13px; color: #2B3490; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: block; }
        .evt-title { font-family: 'Rajdhani', sans-serif; font-size: 19px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; line-height: 1.4; }
        .evt-location { font-size: 14px; color: #666; margin: 0 0 8px; }
        .evt-desc { font-size: 15px; color: #666; line-height: 1.6; margin: 0; }
        .evt-empty { text-align: center; padding: 64px 20px; color: #999; }
        @media (max-width: 1024px) { .evt-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .evt-grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="evt-hero">
        <div className="responsive-container">
          <div style={{ padding: "72px 0" }}>
            <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2.2rem, 4.5vw, 3.6rem)", fontWeight: 700, color: "#fff", lineHeight: 1.08, margin: 0 }}>Campus Events</h1>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 18, lineHeight: 1.6, margin: "16px 0 0", fontWeight: 400, maxWidth: 600 }}>Upcoming events and activities at KSRM College of Engineering</p>
          </div>
        </div>
      </section>

      <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
        <div className="responsive-container">
          {events.length === 0 ? (
            <div className="evt-empty">
              {loaded ? "No upcoming events right now - check back soon." : "Loading events..."}
            </div>
          ) : (
            <div className="evt-grid">
              {events.map((ev) => (
                <div className="evt-card" key={ev.id}>
                  {ev.imageUrl && (
                    <div className="evt-card-image">
                      <img
                        src={ev.imageUrl}
                        alt={ev.title}
                        loading="lazy"
                        onError={(e) => { e.currentTarget.style.display = "none" }}
                      />
                    </div>
                  )}
                  <div className="evt-content">
                    <span className="evt-date">
                      {new Date(ev.eventDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <h3 className="evt-title">{ev.title}</h3>
                    {ev.location && <p className="evt-location">📍 {ev.location}</p>}
                    {ev.description && <p className="evt-desc">{ev.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    
      <PageResources section="events" />
      </main>
  );
}
