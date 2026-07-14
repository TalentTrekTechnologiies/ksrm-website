"use client";

import Link from "next/link";

const TABS = [
  { href: "/placements/overview", label: "Overview" },
  { href: "/placements/mous", label: "MoUs" },
  { href: "/placements/trainings", label: "Trainings" },
  { href: "/placements/internships", label: "Internships" },
  { href: "/placements/our-recruiters", label: "Our Recruiters" },
  { href: "/placements/placements-record", label: "Placements Record" },
];

export default function PlacementsSubnav({ active }: { active: string }) {
  return (
    <div style={{ background: "#ffffff", borderBottom: "1px solid #eef0f3", padding: "24px 0" }}>
      <style>{`
        .placements-subnav-container {
          max-width: 1720px;
          margin: 0 auto;
          padding: 0 16px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
        }
        .placements-subnav-link {
          padding: 10px 24px;
          text-decoration: none;
          color: #555;
          font-weight: 600;
          font-size: 15px;
          border-radius: 24px;
          transition: all 0.3s;
          font-family: 'Rajdhani', sans-serif;
          white-space: nowrap;
          border: 2px solid transparent;
          display: inline-block;
        }
        .placements-subnav-link:hover { color: #2B3490; border-color: #D4A500; }
        .placements-subnav-link.active { background: #2B3490; color: #ffffff; border-color: #2B3490; }
        @media (max-width: 768px) {
          .placements-subnav-container { gap: 8px; }
          .placements-subnav-link { padding: 8px 16px; font-size: 14px; }
        }
      `}</style>
      <div className="placements-subnav-container">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} className={`placements-subnav-link ${active === t.href ? "active" : ""}`}>
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
