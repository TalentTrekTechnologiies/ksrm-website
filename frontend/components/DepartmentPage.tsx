"use client";

import { useEffect, useState } from "react";
import { resolveFileUrl } from "@/lib/api-base";
import type { Department, FacultyMember } from "@/types/department";
import { getDepartmentsPublic } from "@/lib/departments-api";
import { getFacultyPublic, Faculty } from "@/lib/faculty-api";
import { getDepartmentProgrammesPublic } from "@/lib/department-programmes-api";
import { getLabsPublic } from "@/lib/labs-api";
import { getLearningOutcomesPublic } from "@/lib/learning-outcomes-api";
import { getDepartmentHighlightsPublic } from "@/lib/department-highlights-api";
import { getResearchPublic, ResearchRecord } from "@/lib/research-api";
import { getGalleryPublic } from "@/lib/gallery-api";
import { getDownloadsPublic, Download } from "@/lib/downloads-api";
import { getContactChannelsPublic, ContactChannel } from "@/lib/contact-channels-api";
import FacultyGrid from "@/components/faculty/FacultyGrid"
import { getEffectiveDisplaySettings } from "@/lib/department-display-settings-api";
import { getCampusVideosForDepartment, getStatisticsPublic, SiteStatistic, CampusVideo } from "@/lib/homepage-api";
import { getPublicSiteSettings } from "@/lib/site-settings-api";
import { useLiveData, DEFAULT_POLL_INTERVAL_MS } from "@/lib/use-live-data";
import BoardOfStudies from "@/components/departments/BoardOfStudies";

const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "vision-mission", label: "Vision & Mission" },
  { id: "specializations", label: "Specializations" },
  { id: "hod", label: "HOD" },
  { id: "faculty", label: "Faculty" },
  { id: "programmes", label: "Programmes" },
  { id: "labs", label: "Laboratories" },
  { id: "outcomes", label: "Outcomes" },
  // The section this points at renders only when the department has a Board of
  // Studies in the CMS. The link is harmless without it: nothing to scroll to.
  { id: "board-of-studies", label: "Board of Studies" },
];

const LEVEL_LABEL: Record<string, string> = { UG: "Undergraduate", PG: "Postgraduate", PHD: "Ph.D.", DIPLOMA: "Diploma" };

// Department Downloads are grouped by category so a syllabus doesn't sit in the
// same flat pile as brochures/forms - each category gets its own sub-heading,
// in this order (unknown/empty categories fall under "Other Documents", last).
const DOWNLOAD_CATEGORY_LABELS: Record<string, string> = {
  SYLLABUS: "Syllabus",
  QUESTION_PAPER: "Question Papers",
  BROCHURE: "Brochures",
  AFFIDAVIT: "Affidavits",
  FORM: "Forms",
  OTHER: "Other Documents",
};
const DOWNLOAD_CATEGORY_ORDER = ["SYLLABUS", "QUESTION_PAPER", "BROCHURE", "AFFIDAVIT", "FORM", "OTHER"];

function groupDownloadsByCategory(downloads: Download[]): { category: string; items: Download[] }[] {
  const byCat = new Map<string, Download[]>();
  for (const d of downloads) {
    const cat = d.category || "OTHER";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push(d);
  }
  return [...byCat.keys()]
    .sort((a, b) => {
      const ia = DOWNLOAD_CATEGORY_ORDER.indexOf(a);
      const ib = DOWNLOAD_CATEGORY_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    })
    .map((category) => ({ category, items: byCat.get(category)! }));
}

/**
 * Adapts this page's FacultyMember shape to the Faculty record FacultyGrid and
 * the profile view expect. A member with no id (the static fallback data a page
 * ships with, before its CMS faculty load) gets id 0 - the profile still opens
 * and shows the details it has, and simply finds no publications, which is the
 * honest result for a record that is not in the CMS.
 */
function toFacultyRecord(f: FacultyMember): Faculty {
  return {
    id: f.id ?? 0,
    name: f.name,
    designation: f.designation,
    qualification: f.qualification,
    department: f.department ?? "",
    specialization: f.specialization || null,
    experience: f.experience || null,
    email: f.email || null,
    phone: f.phone || null,
    photoUrl: f.photo || null,
    mediaId: null,
    isHod: f.isHod ?? /head|hod/i.test(f.designation),
    isActive: true,
    createdAt: "",
    updatedAt: "",
    departmentId: null,
    welcomeMessage: null,
    sortOrder: 0,
    deletedAt: null,
    deletedBy: null,
    version: 1,
  }
}

export default function DepartmentPage({ department: fallbackDepartment }: { department: Department }) {
  const [activeTab, setActiveTab] = useState("about");
  const [department, setDepartment] = useState<Department>(fallbackDepartment);
  const [achievements, setAchievements] = useState<{ title: string; description: string }[]>([]);
  const [research, setResearch] = useState<ResearchRecord[]>([]);
  const [videos, setVideos] = useState<CampusVideo[]>([]);
  const [downloads, setDownloads] = useState<Download[]>([]);

  // A chapter's uploads are ordinary department documents routed to the
  // Professional Chapters section, so they need no separate table - just
  // separating here keeps them out of the general Downloads list.
  const CHAPTER_SECTION = "professional-chapters";
  const chapterDocs = downloads.filter((d) => d.pageSection === CHAPTER_SECTION);
  const generalDownloads = downloads.filter((d) => d.pageSection !== CHAPTER_SECTION);
  const [contacts, setContacts] = useState<ContactChannel[]>([]);
  const [statistics, setStatistics] = useState<SiteStatistic[]>([]);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [resolvedDepartmentId, setResolvedDepartmentId] = useState<number | null>(null);
  // Global switch (Site Settings -> Department Pages), not per-department: one
  // flip changes every department. Polled rather than fetched once, so flipping
  // it in the admin updates already-open public pages on their own, with no
  // refresh (same reasoning as the homepage's live sections). The fetcher never
  // rejects, so a failed poll settles to {} - photo cards - instead of leaving
  // the faculty section stuck on its skeleton forever.
  const liveSettings = useLiveData<Record<string, string>>(
    () => getPublicSiteSettings().catch(() => ({} as Record<string, string>)),
    [],
  );
  // Gate the faculty section until the switch is known, so a static page (always
  // built in one mode) never flashes the wrong mode. Server and client both
  // start at null -> hydration-safe.
  const settingsLoaded = liveSettings !== null;
  const facultyShowPhotos = liveSettings?.["faculty_show_photos"] !== "false";

  useEffect(() => {
    let cancelled = false

    async function load() {
      let departmentId: number | null = null
      try {
        const items = await getDepartmentsPublic()
        if (cancelled) return
        const match = items.find((d) => d.isActive && d.slug === fallbackDepartment.slug)
        if (!match) return
        departmentId = match.id
        setResolvedDepartmentId(match.id)
        // A department row seeded before its content was written stores its own
        // name as the About text - treat that as "no real About yet". Anything
        // else is prose an admin actually wrote in the CMS.
        const cmsAbout =
          match.about && match.about.trim() !== (match.name ?? "").trim()
            ? match.about
            : undefined
        setDepartment((prev) => ({
          ...prev,
          name: match.name || prev.name,
          shortName: match.shortName ?? prev.shortName,
          tagline: match.tagline ?? prev.tagline,
          about: cmsAbout ?? prev.about,
          // A CMS-written About must actually display: the About section
          // renders the static `overview` paragraphs when present, so an
          // admin's edit was silently invisible on departments (ECE) that ship
          // one. Dropping overview here lets the render's `[department.about]`
          // fallback take over; with no real CMS About, the static file wins.
          ...(cmsAbout ? { overview: undefined } : {}),
          heroImage: match.heroImageUrl ?? prev.heroImage,
          aboutVideo: match.aboutVideoUrl ?? prev.aboutVideo,
          vision: match.vision ?? prev.vision,
          mission: match.mission.length > 0 ? match.mission : prev.mission,
        }))
      } catch {
        // Network/API failure - fallback department (already the initial state) stays.
        return
      }

      if (departmentId === null || cancelled) return
      const id = departmentId

      const [
        facultyRes, programmesRes, labsRes, outcomesRes,
        highlightsRes, achievementsRes, researchRes, galleryRes,
        videosRes, downloadsRes, contactRes, statisticsRes, visibilityRes,
      ] = await Promise.allSettled([
        getFacultyPublic(undefined, id),
        getDepartmentProgrammesPublic(id),
        getLabsPublic(id),
        getLearningOutcomesPublic(id),
        getDepartmentHighlightsPublic(id, "HIGHLIGHT"),
        getDepartmentHighlightsPublic(id, "ACHIEVEMENT"),
        getResearchPublic(id),
        getGalleryPublic(undefined, id),
        getCampusVideosForDepartment(id),
        getDownloadsPublic(undefined, id),
        getContactChannelsPublic(id),
        getStatisticsPublic("department", id),
        getEffectiveDisplaySettings(id),
      ])
      if (cancelled) return

      if (facultyRes.status === "fulfilled" && facultyRes.value.length > 0) {
        setDepartment((prev) => ({
          ...prev,
          faculty: facultyRes.value.map((f) => ({
            // id and isHod carry through so the profile view can load this
            // person's publications and flag the head of department.
            id: f.id,
            name: f.name,
            designation: f.designation,
            qualification: f.qualification,
            photo: f.photoUrl ?? "",
            specialization: f.specialization ?? "",
            experience: f.experience ?? "",
            email: f.email ?? "",
            phone: f.phone ?? "",
            isHod: f.isHod,
            department: f.department,
          })),
        }))
        const hod = facultyRes.value.find((f) => f.isHod)
        if (hod) {
          setDepartment((prev) => ({
            ...prev,
            hod: {
              name: hod.name,
              designation: hod.designation,
              qualification: hod.qualification,
              message: hod.welcomeMessage ? hod.welcomeMessage.split(/\n{2,}/) : prev.hod.message,
              photo: hod.photoUrl ?? prev.hod.photo,
              email: hod.email ?? prev.hod.email,
            },
          }))
        }
      }

      if (programmesRes.status === "fulfilled" && programmesRes.value.length > 0) {
        setDepartment((prev) => ({
          ...prev,
          programmes: programmesRes.value.map((p) => ({
            name: p.name,
            level: LEVEL_LABEL[p.level] ?? p.level,
            intake: String(p.intake),
          })),
        }))
      }

      if (labsRes.status === "fulfilled" && labsRes.value.length > 0) {
        setDepartment((prev) => ({
          ...prev,
          labs: labsRes.value.map((l) => ({ name: l.name, description: l.description, imageUrl: resolveFileUrl(l.imageUrl ?? ""), equipment: l.equipment ?? [] })),
        }))
      }

      if (outcomesRes.status === "fulfilled" && outcomesRes.value.length > 0) {
        const outcomes = outcomesRes.value
        setDepartment((prev) => ({
          ...prev,
          peos: outcomes.filter((o) => o.type === "PEO").length > 0
            ? outcomes.filter((o) => o.type === "PEO").map((o) => ({ code: o.code, text: o.text }))
            : prev.peos,
          pos: outcomes.filter((o) => o.type === "PO").length > 0
            ? outcomes.filter((o) => o.type === "PO").map((o) => ({ code: o.code, title: o.title ?? "", text: o.text }))
            : prev.pos,
          psos: outcomes.filter((o) => o.type === "PSO").length > 0
            ? outcomes.filter((o) => o.type === "PSO").map((o) => ({ code: o.code, text: o.text }))
            : prev.psos,
        }))
      }

      if (highlightsRes.status === "fulfilled" && highlightsRes.value.length > 0) {
        setDepartment((prev) => ({
          ...prev,
          aiHighlights: highlightsRes.value.map((h) => ({ title: h.title, description: h.description })),
        }))
      }

      if (achievementsRes.status === "fulfilled") {
        setAchievements(achievementsRes.value.map((h) => ({ title: h.title, description: h.description })))
      }
      if (researchRes.status === "fulfilled") setResearch(researchRes.value)
      if (galleryRes.status === "fulfilled" && galleryRes.value.length > 0) {
        // Skip "__video__"-tagged rows: those are page-published videos stored
        // in the Gallery table (see PageResources), not photos - rendering one
        // through an <img> gives a broken tile.
        setDepartment((prev) => ({
          ...prev,
          gallery: galleryRes.value.filter((g) => g.category !== "__video__").map((g) => resolveFileUrl(g.imageUrl)),
        }))
      }
      if (videosRes.status === "fulfilled") setVideos(videosRes.value)
      if (downloadsRes.status === "fulfilled") setDownloads(downloadsRes.value)
      if (contactRes.status === "fulfilled") setContacts(contactRes.value)
      if (statisticsRes.status === "fulfilled") setStatistics(statisticsRes.value)
      if (visibilityRes.status === "fulfilled") setVisibility(visibilityRes.value)
    }

    // Re-run the whole load on an interval, not just once on mount: an edit
    // published in the admin (faculty, labs, outcomes, programmes, visibility)
    // then shows up on an already-open page without a refresh. Same env-aware
    // cadence as the homepage's live sections - 2s dev / 30s prod.
    load()
    const interval = setInterval(load, DEFAULT_POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [fallbackDepartment])

  // Absence of a key means "visible" by default - matches the backend
  // catalog's default (see DEPARTMENT_DISPLAY_SETTINGS_CATALOG).
  const isVisible = (key: string) => visibility[key] !== false

  const scrollTo = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{`
        .responsive-container {
          width: 100%;
          max-width: 1760px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }
        @media (max-width: 1024px) {
          .responsive-container { padding-left: 32px; padding-right: 32px; }
        }
        @media (max-width: 768px) {
          .responsive-container { padding-left: 20px; padding-right: 20px; }
        }
        @media (max-width: 480px) {
          .responsive-container { padding-left: 14px; padding-right: 14px; }
        }

        .dept-hero {
          position: relative;
          background-size: cover;
          background-position: center;
          min-height: 280px;
          display: flex;
          align-items: flex-end;
          padding-bottom: 40px;
          overflow: hidden;
        }
        .dept-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 100%;
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%);
          pointer-events: none;
        }
        .dept-hero > * { position: relative; z-index: 2; }

        .dept-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #D4A500;
          margin-bottom: 16px;
        }
        .dept-hero-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(2.2rem, 4.5vw, 3.6rem);
          font-weight: 700;
          color: #fff;
          line-height: 1.08;
          margin: 0;
          text-shadow: 0 2px 12px rgba(0,0,0,0.7);
        }
        .dept-hero-tagline {
          color: rgba(255,255,255,0.85);
          font-size: 19px;
          line-height: 1.6;
          margin: 16px 0 0;
          font-weight: 400;
          text-shadow: 0 2px 8px rgba(0,0,0,0.6);
        }

        .dept-sticky-nav {
          position: sticky;
          top: 48px;
          background: #fff;
          border-bottom: 1px solid #eef0f3;
          z-index: 100;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .dept-sticky-nav::-webkit-scrollbar { display: none; }
        .dept-nav-container {
          display: flex;
          gap: 8px;
          padding: 12px 5%;
          min-width: max-content;
        }
        .dept-nav-pill {
          padding: 10px 18px;
          border-radius: 24px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'Rajdhani', sans-serif;
          border: 1.5px solid #eef0f3;
          background: #fff;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .dept-nav-pill.active {
          background: #2B3490;
          color: #fff;
          border-color: #2B3490;
        }
        .dept-nav-pill:hover { border-color: #2B3490; }

        .dept-section-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 24px;
        }
        .dept-section-title-sm {
          font-family: 'Rajdhani', sans-serif;
          font-size: clamp(1.6rem, 2.8vw, 2.2rem);
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 24px;
        }

        .dept-card {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 16px;
          padding: 32px;
        }
        .dept-download-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .dept-download-grid .dept-card {
          display: flex !important;
          flex-direction: row !important;
          align-items: center;
          gap: 16px !important;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px 20px;
          transition: all 0.2s ease;
        }
        .dept-download-grid .dept-card:hover {
          border-color: #D4A500;
          box-shadow: 0 8px 20px rgba(43,52,144,0.08);
        }
        .dept-download-grid .dept-card h3 {
          color: #2B3490 !important;
          font-family: inherit !important;
          font-size: 15px !important;
          line-height: 1.4 !important;
        }
        .dept-download-grid .dept-card p {
          color: #999 !important;
          font-size: 13px !important;
          margin-top: 2px !important;
        }
        .dept-download-grid .dept-card > span {
          margin-left: auto;
          flex-shrink: 0;
          color: #fff !important;
          background: #2B3490;
          padding: 5px 14px;
          border-radius: 4px;
          font-size: 13px !important;
          font-weight: 700 !important;
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .dept-download-grid .dept-card { align-items: flex-start; }
          .dept-download-grid .dept-card > span { display: none; }
        }

        .dept-career-grid { display: flex; flex-wrap: wrap; gap: 12px; }
        .dept-career-tag {
          display: inline-flex;
          align-items: center;
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-left: 3px solid #D4A500;
          border-radius: 8px;
          padding: 10px 16px;
          font-size: 15px;
          color: #1a1a2e;
          font-weight: 600;
        }
        .dept-why-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 14px;
        }
        .dept-why-list li {
          position: relative;
          padding-left: 32px;
          color: #555;
          font-size: 16px;
          line-height: 1.6;
        }
        .dept-why-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          top: 0;
          width: 22px;
          height: 22px;
          background: #2B3490;
          color: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
        }
        .dept-closing-callout {
          margin-top: 48px;
          background: linear-gradient(135deg, #2B3490 0%, #1e2570 100%);
          color: #fff;
          border-radius: 16px;
          padding: 32px 40px;
          font-size: 18px;
          line-height: 1.7;
          font-weight: 500;
        }

        .dept-faculty-skeleton {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 24px;
        }
        .dept-faculty-sk {
          height: 300px;
          border-radius: 16px;
          background: #eef0f3;
          animation: deptSkPulse 1.4s ease-in-out infinite;
        }
        @keyframes deptSkPulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }

        .dept-faculty-table-wrap { overflow-x: auto; border: 1px solid #eef0f3; border-radius: 12px; }
        .dept-faculty-table { width: 100%; border-collapse: collapse; font-size: 15px; background: #fff; }
        .dept-faculty-table thead th {
          background: #2B3490; color: #fff; text-align: left; padding: 14px 16px;
          font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 13px;
          text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap;
        }
        .dept-faculty-table tbody td { padding: 12px 16px; border-bottom: 1px solid #eef0f3; color: #555; vertical-align: top; }
        .dept-faculty-table tbody tr:last-child td { border-bottom: none; }
        .dept-faculty-table tbody tr:nth-child(even) { background: #f7f8fa; }
        .dept-faculty-table .name { font-weight: 700; color: #1a1a2e; white-space: nowrap; }
        .dept-faculty-table a { color: #2B3490; text-decoration: none; }
        .dept-faculty-table a:hover { text-decoration: underline; }

        .dept-vision-quote {
          border-left: 4px solid #D4A500;
          padding-left: 24px;
          margin: 24px 0;
        }

        .dept-mission-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        .dept-mission-item {
          background: #f7f8fa;
          border: 1px solid #eef0f3;
          border-radius: 16px;
          padding: 32px;
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .dept-mission-num {
          width: 32px; height: 32px;
          border-radius: 50px;
          background: #D4A500;
          color: #2B3490;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px; font-weight: 700;
          flex-shrink: 0;
        }

        .dept-ai-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }
        .dept-ai-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          padding: 24px;
          transition: all 0.3s;
        }
        .dept-ai-card h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 19px;
          font-weight: 700;
          color: #2B3490;
          margin: 0 0 12px;
        }
        .dept-ai-card p {
          font-size: 16px;
          color: #666;
          line-height: 1.6;
          margin: 0;
        }

        /* First column matches a faculty card's width so the HOD's photo is
           the same size as everyone else's, rather than a 320px portrait
           towering over the grid below it. */
        .dept-hod-grid {
          display: grid;
          grid-template-columns: 213px 1fr;
          gap: 40px;
        }
        @media (max-width: 768px) {
          .dept-hod-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }

        .dept-faculty-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          margin-top: 24px;
        }
        @media (max-width: 1024px) {
          .dept-faculty-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
        }
        @media (max-width: 640px) {
          .dept-faculty-grid { grid-template-columns: 1fr; }
        }
        .dept-faculty-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .dept-faculty-card.hod {
          border: 2px solid #D4A500;
          box-shadow: 0 8px 32px rgba(255, 230, 25, 0.12);
        }
        .dept-faculty-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(43,52,144,0.12);
        }
        .dept-faculty-photo {
          width: 100%;
          aspect-ratio: 3 / 3.5;
          border-radius: 12px 12px 0 0;
          overflow: hidden;
          background: linear-gradient(135deg, #2B3490, #1e2570);
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .dept-faculty-hod-badge {
          position: absolute;
          top: 12px; right: 12px;
          background: #D4A500;
          color: #1a1a2e;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
          letter-spacing: 0.5px;
          z-index: 10;
        }
        .dept-faculty-initials {
          width: 56px; height: 56px;
          border-radius: 50%;
          background: rgba(255,230,25,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .dept-faculty-initials p {
          color: #D4A500;
          font-size: 20px;
          font-weight: 700;
          font-family: 'Rajdhani', sans-serif;
          margin: 0;
          letter-spacing: 1px;
        }
        .dept-faculty-info { padding: 20px; }
        .dept-faculty-info h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 17px; font-weight: 700; color: #1a1a2e;
          margin: 0 0 6px;
        }
        .dept-faculty-designation {
          color: #D4A500;
          font-size: 13px; font-weight: 700;
          margin: 0 0 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .dept-faculty-qual { color: #777; font-size: 14px; margin: 0 0 12px; line-height: 1.4; }
        .dept-faculty-spec {
          display: inline-block;
          background: #eef1ff;
          color: #2B3490;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px; font-weight: 600;
          font-family: 'Rajdhani', sans-serif;
          line-height: 1.2;
        }

        .dept-programmes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        .dept-prog-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 140px), 1fr));
          gap: 12px;
          margin-top: 8px;
        }

        .dept-labs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        .dept-lab-card {
          background: #fff;
          border: 1px solid #eef0f3;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .dept-lab-img {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
        }
        .dept-lab-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .dept-lab-body { padding: 20px; }
        .dept-lab-body h3 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0;
        }
        .dept-lab-body p { color: #666; font-size: 16px; line-height: 1.6; margin: 8px 0 0; }

        .dept-outcomes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 24px;
        }
        .dept-pos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 16px;
          margin-top: 24px;
        }
        .dept-po-item {
          background: #f7f8fa;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #eef0f3;
        }
        .dept-po-item h4 {
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px; font-weight: 700; color: #2B3490;
          margin: 0 0 6px;
        }
        .dept-po-item p { color: #555; font-size: 14px; line-height: 1.6; margin: 0; }

        @media (max-width: 900px) {
          .dept-programmes-grid, .dept-labs-grid, .dept-outcomes-grid,
          .dept-pos-grid, .dept-mission-grid, .dept-faculty-grid {
            grid-template-columns: 1fr;
          }
          /* Stack the About text + video so the video isn't squeezed to a
             tiny half-width column on phones/tablets. !important overrides the
             inline "1fr 1fr" set on the element. */
          .dept-about-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
      `}</style>

      <main style={{ background: "#ffffff" }}>
        {/* HERO */}
        <section
          className="dept-hero"
          style={{ backgroundImage: `url('${department.heroImage}')` }}
        >
          <div className="responsive-container">
            <div className="dept-eyebrow">{department.shortName}</div>
            <h1 className="dept-hero-title">{department.name}</h1>
            <p className="dept-hero-tagline">{department.tagline}</p>
          </div>
        </section>

        {/* STICKY NAV */}
        <div className="dept-sticky-nav">
          <div className="dept-nav-container">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`dept-nav-pill ${activeTab === item.id ? "active" : ""}`}
                onClick={() => scrollTo(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* ABOUT */}
        {isVisible("about.showSection") && (
        <section id="about" style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 className="dept-section-title">About the Department</h2>
            <div className="dept-about-grid" style={{ display: "grid", gridTemplateColumns: department.aboutVideo ? "1fr 1fr" : "1fr", gap: 48, alignItems: "start" }}>
              <div style={{ maxWidth: 900 }}>
                {(department.overview?.length ? department.overview : [department.about]).map((para, i) => (
                  <p key={i} style={{ color: "#555", fontSize: 17, lineHeight: 1.8, margin: i === 0 ? 0 : "16px 0 0" }}>
                    {para}
                  </p>
                ))}
              </div>
              {department.aboutVideo && (
                <video
                  width="100%"
                  height="auto"
                  style={{ borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}
                  controls
                  autoPlay
                  muted
                  loop
                >
                  <source src={department.aboutVideo} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>

            {department.whyDepartment && department.whyDepartment.length > 0 && (
              <div style={{ marginTop: 56, maxWidth: 900 }}>
                <h3 className="dept-section-title-sm">Why {department.shortName} at KSRMCE?</h3>
                {department.whyDepartment.map((para, i) => (
                  <p key={i} style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: i === 0 ? 0 : "16px 0 0" }}>{para}</p>
                ))}
              </div>
            )}

            {department.specialty && department.specialty.length > 0 && (
              <div style={{ marginTop: 48, maxWidth: 900 }}>
                <h3 className="dept-section-title-sm">Our Specialty &ndash; Future &amp; Scope</h3>
                {department.specialty.map((para, i) => (
                  <p key={i} style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: i === 0 ? 0 : "16px 0 0" }}>{para}</p>
                ))}
              </div>
            )}

            {department.careerOpportunities && department.careerOpportunities.length > 0 && (
              <div style={{ marginTop: 48 }}>
                <h3 className="dept-section-title-sm">Career Opportunities</h3>
                <div className="dept-career-grid">
                  {department.careerOpportunities.map((c, i) => (
                    <span className="dept-career-tag" key={i}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            {department.whyChoose && department.whyChoose.length > 0 && (
              <div style={{ marginTop: 48 }}>
                <h3 className="dept-section-title-sm">Why Choose {department.shortName} at KSRMCE?</h3>
                <ul className="dept-why-list">
                  {department.whyChoose.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {department.closingStatement && (
              <div className="dept-closing-callout">{department.closingStatement}</div>
            )}
          </div>
        </section>
        )}

        {/* AI HIGHLIGHTS */}
        {isVisible("highlights.showSection") && department.aiHighlights?.length > 0 && (
          <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
            <div className="responsive-container">
              <h2 className="dept-section-title" style={{ marginBottom: 48 }}>
                🤖 AI-Enabled Highlights
              </h2>
              <div className="dept-ai-grid">
                {department.aiHighlights.map((h, i) => (
                  <div className="dept-ai-card" key={i}>
                    <h3>✨ {h.title}</h3>
                    <p>{h.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* VISION & MISSION */}
        {isVisible("vision.showSection") && (
        <section id="vision-mission" style={{ padding: "72px 0", background: "#f7f8fa" }}>
          <div className="responsive-container">
            <div style={{ maxWidth: 820, marginBottom: 56 }}>
              <h2 className="dept-section-title">Vision</h2>
              <div className="dept-vision-quote">
                <p style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 18, fontWeight: 600, color: "#2B3490",
                  lineHeight: 1.6, margin: 0,
                }}>
                  &quot;{department.vision}&quot;
                </p>
              </div>
            </div>
            <div>
              <h2 className="dept-section-title">Mission</h2>
              <div className="dept-mission-grid">
                {department.mission.map((m, i) => (
                  <div className="dept-mission-item" key={i}>
                    <div className="dept-mission-num">{i + 1}</div>
                    <p style={{ color: "#555", fontSize: 16, lineHeight: 1.7, margin: 0 }}>{m}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* HOD */}
        {isVisible("hod.showSection") && (
        <section id="hod" style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 className="dept-section-title" style={{ marginBottom: 40 }}>Head of Department</h2>
            <div className="dept-hod-grid">
              <div>
                {isVisible("hod.showPhoto") && (
                <div style={{
                  width: "100%", aspectRatio: "1/1", borderRadius: 10, overflow: "hidden",
                  background: "linear-gradient(135deg, #2B3490, #1e2570)",
                  display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
                }}>
                  {department.hod.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={department.hod.photo} alt={department.hod.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                  ) : null}
                </div>
                )}
                <div className="dept-card" style={{ marginTop: 24 }}>
                  <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#1a1a2e", margin: "0 0 8px" }}>
                    {department.hod.name}
                  </h3>
                  <p style={{ color: "#2B3490", fontSize: 12, fontWeight: 700, margin: "0 0 12px", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {department.hod.designation}
                  </p>
                  <p style={{ color: "#666", fontSize: 15, margin: "0 0 16px", borderTop: "1px solid #eef0f3", paddingTop: 12 }}>
                    {department.hod.qualification}
                  </p>
                  {isVisible("hod.showContact") && (
                  <a href={`mailto:${department.hod.email}`} style={{ color: "#2B3490", fontSize: 14, textDecoration: "none", fontWeight: 600 }}>
                    {department.hod.email}
                  </a>
                  )}
                </div>
              </div>
              {isVisible("hod.showMessage") && (
              <div style={{ paddingTop: 20 }}>
                <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(1.4rem, 2.4vw, 1.9rem)", fontWeight: 700, color: "#1a1a2e", margin: "0 0 24px" }}>
                  Message
                </h3>
                {department.hod.message.map((p, i) => (
                  <p key={i} style={{ color: "#555", fontSize: 16, lineHeight: 1.8, margin: "0 0 16px" }}>{p}</p>
                ))}
              </div>
              )}
            </div>
          </div>
        </section>
        )}

        {/* FACULTY */}
        {isVisible("faculty.showSection") && (
        <section id="faculty" style={{ padding: "72px 0", background: "#f7f8fa" }}>
          <div className="responsive-container">
            <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Our Faculty</h2>
            {/* Global switch (Site Settings): on = photo cards for every
                department, off = a compact data list (no photos) everywhere.
                Until the switch is known, show a neutral skeleton so a static
                page never flashes the wrong mode. */}
            {!settingsLoaded ? (
              <div className="dept-faculty-skeleton" aria-hidden="true">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div className="dept-faculty-sk" key={i} />
                ))}
              </div>
            ) : facultyShowPhotos ? (
            <FacultyGrid
              faculty={department.faculty.map(toFacultyRecord)}
              showPhotos
            />
            ) : (
            <div className="dept-faculty-table-wrap">
              <table className="dept-faculty-table">
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>#</th>
                    <th>Name</th>
                    <th>Designation</th>
                    {isVisible("faculty.showQualification") && <th>Qualification</th>}
                    <th>Specialization</th>
                    {isVisible("faculty.showExperience") && <th>Experience</th>}
                    {isVisible("faculty.showEmail") && <th>Email</th>}
                  </tr>
                </thead>
                <tbody>
                  {department.faculty.map((f, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td className="name">{f.name}</td>
                      <td>{f.designation}</td>
                      {isVisible("faculty.showQualification") && <td>{f.qualification || "—"}</td>}
                      <td>{f.specialization || "—"}</td>
                      {isVisible("faculty.showExperience") && <td>{f.experience || "—"}</td>}
                      {isVisible("faculty.showEmail") && (
                        <td>{f.email ? <a href={`mailto:${f.email}`}>{f.email}</a> : "—"}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </section>
        )}

        {/* PROGRAMMES */}
        {isVisible("programmes.showSection") && (
        <section id="programmes" style={{ padding: "72px 0", background: "#f7f8fa" }}>
          <div className="responsive-container">
            <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Programmes Offered</h2>
            <div className="dept-programmes-grid">
              {department.programmes.map((p, i) => (
                <div className="dept-card" key={i} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 17, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                    {p.name}
                  </h3>
                  <div className="dept-prog-details">
                    <div>
                      <p style={{ color: "#666", fontSize: 13, margin: "0 0 4px", textTransform: "uppercase", fontWeight: 600 }}>Level</p>
                      <p style={{ color: "#1a1a2e", fontSize: 15, fontWeight: 600, margin: 0 }}>{p.level}</p>
                    </div>
                    {p.intake && (
                      <div>
                        <p style={{ color: "#666", fontSize: 13, margin: "0 0 4px", textTransform: "uppercase", fontWeight: 600 }}>Intake</p>
                        <p style={{ color: "#1a1a2e", fontSize: 15, fontWeight: 600, margin: 0 }}>{p.intake}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* LABORATORIES */}
        {isVisible("labs.showSection") && (
        <section id="labs" style={{ padding: "72px 0", background: "#ffffff" }}>
          <div className="responsive-container">
            <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Laboratories</h2>
            <div className="dept-labs-grid">
              {department.labs.map((lab, i) => (
                <div className="dept-lab-card" key={i}>
                  <div className="dept-lab-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={lab.imageUrl} alt={lab.name} loading="lazy" />
                  </div>
                  <div className="dept-lab-body">
                    <h3>{lab.name}</h3>
                    <p>{lab.description}</p>
                    {isVisible("labs.showEquipment") && (lab.equipment?.length ?? 0) > 0 && (
                      <p style={{ color: "#666", fontSize: 13, marginTop: 8 }}>
                        <strong>Equipment:</strong> {lab.equipment!.join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* BOARD OF STUDIES - Admin -> Committees, type "Board of Studies",
            with this department picked. Renders nothing until one exists, so
            every department has the section available without any of them
            being forced to show an empty one. */}
        <BoardOfStudies departmentId={resolvedDepartmentId} />

        {/* OUTCOMES: PEOs / PSOs / POs */}
        <section id="outcomes" style={{ padding: "72px 0", background: "#f7f8fa" }}>
          <div className="responsive-container">
            {isVisible("peo.showSection") && (
            <div style={{ marginBottom: 56 }}>
              <h2 className="dept-section-title-sm">Programme Educational Objectives (PEOs)</h2>
              <div className="dept-outcomes-grid">
                {department.peos.map((peo) => (
                  <div className="dept-card" key={peo.code}>
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 17, fontWeight: 700, color: "#2B3490", margin: "0 0 8px" }}>
                      {peo.code}
                    </h3>
                    <p style={{ color: "#555", fontSize: 15, lineHeight: 1.7, margin: 0 }}>{peo.text}</p>
                  </div>
                ))}
              </div>
            </div>
            )}

            {isVisible("pso.showSection") && (
            <div style={{ marginBottom: 56 }}>
              <h2 className="dept-section-title-sm">Programme Specific Outcomes (PSOs)</h2>
              <div className="dept-outcomes-grid">
                {department.psos.map((pso) => (
                  <div className="dept-card" key={pso.code}>
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#2B3490", margin: "0 0 8px" }}>
                      {pso.code}
                    </h3>
                    <p style={{ color: "#555", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{pso.text}</p>
                  </div>
                ))}
              </div>
            </div>
            )}

            {isVisible("po.showSection") && (
            <div>
              <h2 className="dept-section-title-sm">Programme Outcomes (POs) - NBA Standards</h2>
              <div className="dept-pos-grid">
                {department.pos.map((po) => (
                  <div className="dept-po-item" key={po.code}>
                    <h4>{po.code}: {po.title}</h4>
                    <p>{po.text}</p>
                  </div>
                ))}
              </div>
            </div>
            )}
          </div>
        </section>

        {/* ACHIEVEMENTS */}
        {isVisible("achievements.showSection") && achievements.length > 0 && (
          <section style={{ padding: "72px 0", background: "#ffffff" }}>
            <div className="responsive-container">
              <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Achievements</h2>
              <div className="dept-ai-grid">
                {achievements.map((a, i) => (
                  <div className="dept-ai-card" key={i}>
                    <h3>{a.title}</h3>
                    <p>{a.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RESEARCH: Publications / Projects / Patents */}
        {isVisible("research.showSection") && research.length > 0 && (() => {
          // `type` is a free-text field (see Research model) - classify by
          // substring match so the field-level Show Publications/Projects/
          // Patents/Videos toggles have something to filter on. An item
          // whose type doesn't match any known category is never hidden by
          // these toggles - only research.showSection can hide those.
          const CATEGORY_TOGGLE: [RegExp, string][] = [
            [/publication/i, "research.showPublications"],
            [/project/i, "research.showProjects"],
            [/patent/i, "research.showPatents"],
            [/video/i, "research.showVideos"],
          ];
          const visibleResearch = research.filter((r) => {
            const match = CATEGORY_TOGGLE.find(([re]) => re.test(r.type));
            return !match || isVisible(match[1]);
          });
          if (visibleResearch.length === 0) return null;
          return (
          <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
            <div className="responsive-container">
              <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Research</h2>
              <div className="dept-outcomes-grid">
                {visibleResearch.map((r) => (
                  <div className="dept-card" key={r.id}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#D4A500", textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 6px" }}>
                      {r.type} · {r.year}
                    </p>
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: "0 0 6px" }}>
                      {r.title}
                    </h3>
                    <p style={{ color: "#666", fontSize: 14, margin: "0 0 8px" }}>{r.authors}{r.journal ? ` · ${r.journal}` : ""}</p>
                    {r.attachmentUrl && (
                      <a href={r.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: "#2B3490", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                        View document →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
          );
        })()}

        {/* GALLERY */}
        {isVisible("gallery.showSection") && (department.gallery?.length ?? 0) > 0 && (
          <section style={{ padding: "72px 0", background: "#ffffff" }}>
            <div className="responsive-container">
              <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Gallery</h2>
              <div className="dept-labs-grid">
                {department.gallery!.map((url, i) => (
                  <div className="dept-lab-img" key={i} style={{ borderRadius: 12 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* VIDEOS */}
        {isVisible("videos.showSection") && videos.length > 0 && (
          <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
            <div className="responsive-container">
              <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Videos</h2>
              <div className="dept-labs-grid">
                {videos.map((v) => (
                  <div key={v.id} className="dept-lab-card">
                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
                      <iframe
                        src={v.youtubeUrl}
                        title={v.title}
                        style={{ width: "100%", height: "100%", border: 0 }}
                        allowFullScreen
                      />
                    </div>
                    <div className="dept-lab-body">
                      <h3>{v.title}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PROFESSIONAL CHAPTER ACTIVITIES
            Anything the department's chapter uploads - filed under Documents
            with this department and the "Campus Life -> Professional Chapters"
            section. Split out from the general Downloads block below so a
            chapter's event reports are not buried among syllabi and forms. */}
        {chapterDocs.length > 0 && (
          <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
            <div className="responsive-container">
              <h2 className="dept-section-title" style={{ marginBottom: 8 }}>Professional Chapter</h2>
              <p style={{ color: "#666", fontSize: 15, margin: "0 0 32px" }}>
                Activities, events and reports from this department&apos;s student chapter.
              </p>
              <div className="dept-download-grid">
                {chapterDocs.map((d) => {
                  // A chapter posts photos and video links as often as PDFs, so
                  // show a picture as a picture rather than as a file link.
                  const isImage = /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(d.fileUrl)
                  return (
                    <a
                      key={d.id}
                      href={resolveFileUrl(d.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="dept-card"
                      style={{ display: "flex", flexDirection: "column", gap: 6, textDecoration: "none", overflow: "hidden" }}
                    >
                      {isImage && (
                        // eslint-disable-next-line @next/next/no-img-element -- CMS-supplied URL
                        <img
                          src={resolveFileUrl(d.fileUrl)}
                          alt={d.title}
                          loading="lazy"
                          style={{ width: "100%", aspectRatio: "16 / 10", objectFit: "cover", borderRadius: 6, marginBottom: 4 }}
                        />
                      )}
                      <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                        {d.title}
                      </h3>
                      {d.description && (
                        <p style={{ color: "#666", fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>{d.description}</p>
                      )}
                      <span style={{ color: "#2B3490", fontSize: 12.5, fontWeight: 700, marginTop: 4 }}>
                        {isImage ? "View →" : "Open →"}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* DOWNLOADS */}
        {isVisible("downloads.showSection") && generalDownloads.length > 0 && (
          <section style={{ padding: "72px 0", background: "#ffffff" }}>
            <div className="responsive-container">
              <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Downloads</h2>
              {groupDownloadsByCategory(generalDownloads).map((group) => (
                <div key={group.category} style={{ marginBottom: 36 }}>
                  <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 20, fontWeight: 700, color: "#2B3490", borderLeft: "4px solid #D4A500", paddingLeft: 14, margin: "0 0 20px" }}>
                    {DOWNLOAD_CATEGORY_LABELS[group.category] ?? group.category}
                  </h3>
                  <div className="dept-download-grid">
                    {group.items.map((d) => (
                      <a
                        key={d.id}
                        href={resolveFileUrl(d.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="dept-card"
                        style={{ display: "flex", flexDirection: "column", gap: 6, textDecoration: "none" }}
                      >
                        <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: 0 }}>
                          {d.title}
                        </h3>
                        {d.description && <p style={{ color: "#666", fontSize: 14, margin: 0 }}>{d.description}</p>}
                        <span style={{ color: "#2B3490", fontSize: 13, fontWeight: 600 }}>Download →</span>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* STATISTICS */}
        {isVisible("statistics.showSection") && statistics.length > 0 && (
          <section style={{ padding: "56px 0", background: "#2B3490" }}>
            <div className="responsive-container">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 24, textAlign: "center" }}>
                {statistics.map((s) => (
                  <div key={s.id}>
                    <p style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 700, color: "#D4A500", margin: 0 }}>
                      {s.value}{s.suffix}
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, margin: "4px 0 0" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CONTACT */}
        {isVisible("contact.showSection") && contacts.length > 0 && (
          <section style={{ padding: "72px 0", background: "#f7f8fa" }}>
            <div className="responsive-container">
              <h2 className="dept-section-title" style={{ marginBottom: 32 }}>Contact Information</h2>
              <div className="dept-programmes-grid">
                {contacts.map((c) => (
                  <div className="dept-card" key={c.id}>
                    <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a1a2e", margin: "0 0 10px" }}>
                      {c.name}
                    </h3>
                    {c.phones.map((p) => (
                      <p key={p} style={{ color: "#555", fontSize: 14, margin: "0 0 4px" }}>{p}</p>
                    ))}
                    {c.emails.map((e) => (
                      <a key={e} href={`mailto:${e}`} style={{ display: "block", color: "#2B3490", fontSize: 14, margin: "0 0 4px", textDecoration: "none" }}>
                        {e}
                      </a>
                    ))}
                    {c.address && <p style={{ color: "#666", fontSize: 13, marginTop: 8 }}>{c.address}</p>}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
