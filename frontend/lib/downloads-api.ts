import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export type DownloadCategory = "SYLLABUS" | "QUESTION_PAPER" | "BROCHURE" | "AFFIDAVIT" | "FORM" | "OTHER";

// Page/section slugs a document can be routed to, so it appears on that
// public page's "Downloads & Resources" block. Keep the value (slug) stable;
// the label is what the admin sees in the dropdown.
export const PAGE_SECTIONS: { value: string; label: string }[] = [
  { value: "edc", label: "EDC — Entrepreneurship Development Cell" },
  { value: "iic", label: "IIC — Institution's Innovation Council" },
  // IQAC is split into its page's tabs so an upload lands in the right one -
  // an AQAR report under AQAR Reports, an apex-body document under Apex
  // Bodies - instead of the page's catch-all block at the bottom.
  { value: "professional-chapters", label: "Campus Life → Professional Chapters" },
  { value: "iqac.composition", label: "IQAC → Composition" },
  { value: "iqac.minutes", label: "IQAC → Minutes & Agenda" },
  { value: "iqac.aqar", label: "IQAC → AQAR Reports" },
  { value: "iqac.survey", label: "IQAC → Student Survey" },
  { value: "iqac.apex", label: "IQAC → Apex Bodies" },
  { value: "iqac", label: "IQAC → Other Documents" },
  { value: "naac", label: "NAAC" },
  { value: "alumni", label: "Alumni" },
  { value: "syllabus", label: "Syllabus" },
  // Examinations is split into its page's sub-sections so an upload lands in
  // the right list (e.g. a timetable under Time Tables, results under Exam
  // Results) instead of the page's catch-all block.
  { value: "examinations.calendars", label: "Examinations → Academic Calendars" },
  { value: "examinations.notifications", label: "Examinations → Notifications" },
  { value: "examinations.timetables", label: "Examinations → Time Tables" },
  { value: "examinations.results", label: "Examinations → Exam Results" },
  { value: "examinations", label: "Examinations → Other Documents" },
  { value: "research", label: "Research" },
  { value: "library", label: "Library" },
  { value: "sports", label: "Sports" },
  { value: "cultural", label: "Cultural" },
  { value: "nss", label: "NSS" },
  { value: "hostels", label: "Hostels" },
  { value: "transport", label: "Transport" },
  { value: "anti-ragging", label: "Anti-Ragging" },
  { value: "admissions", label: "Admissions" },
  { value: "placements", label: "Placements" },
  // --- Pages wired up in the "every page manageable" pass. Each has a
  // matching <PageResources section="..."/> on its public page, so anything
  // uploaded here actually renders there.
  { value: "about", label: "About Us" },
  { value: "accreditation", label: "Accreditation" },
  { value: "mandatory-disclosure", label: "Mandatory Disclosure" },
  { value: "events", label: "Events" },
  { value: "careers", label: "Careers" },
  { value: "contact", label: "Contact Us" },
  { value: "academics.calendar", label: "Academics → Academic Calendar" },
  { value: "academics.courses-intake", label: "Academics → Courses & Intake" },
  { value: "academics.fee-structure", label: "Academics → Fee Structure" },
  { value: "academics.regulations", label: "Academics → Regulations" },
  { value: "academics.faculty", label: "Academics → Faculty" },
  { value: "admissions.ug", label: "Admissions → B.Tech (UG)" },
  { value: "admissions.pg", label: "Admissions → PG" },
  { value: "admissions.diploma", label: "Admissions → Diploma" },
  { value: "campus-facilities", label: "Campus Facilities" },
  { value: "grievance", label: "Grievance Redressal" },
  { value: "startup-cell", label: "Startup Cell" },
  { value: "placements.internships", label: "Placements → Internships" },
  { value: "placements.mous", label: "Placements → MoUs" },
  { value: "placements.recruiters", label: "Placements → Our Recruiters" },
  { value: "placements.record", label: "Placements → Placement Record" },
  { value: "placements.trainings", label: "Placements → Trainings" },
]

export interface Download {
  id: number;
  title: string;
  description: string | null;
  category: DownloadCategory;
  pageSection: string | null;
  groupLabel: string | null;
  fileUrl: string;
  /** Media Library reference, or null when using a manually-typed fileUrl
   * (legacy path, still supported). */
  mediaId: number | null;
  departmentId: number | null;
  sortOrder: number;
  isActive: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface DownloadInput {
  title: string;
  description?: string | null;
  category: DownloadCategory;
  pageSection?: string | null;
  groupLabel?: string | null;
  fileUrl: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing fileUrl. */
  mediaId?: number | null;
  departmentId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export function getDownloadsPublic(
  category?: DownloadCategory,
  departmentId?: number,
  pageSection?: string,
): Promise<Download[]> {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (pageSection) params.set("pageSection", pageSection);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<Download[]>(`/downloads${query}`);
}

export function getDownloadsAdmin(includeDeleted = false, departmentId?: number, mediaId?: number): Promise<Download[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  if (mediaId !== undefined) params.set("mediaId", String(mediaId));
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<Download[]>(`/downloads/admin${query}`);
}

export function createDownload(dto: DownloadInput): Promise<Download> {
  return apiPost<Download>("/downloads", dto);
}

/** One file in a bulk publish - only what differs per document. */
export interface BulkDownloadItem {
  title: string;
  /** Optional when mediaId is set - the server resolves the id to its file URL. */
  fileUrl?: string;
  mediaId?: number;
}

export interface BulkDownloadsInput {
  items: BulkDownloadItem[];
  /** Applied to every item in the batch. */
  category: DownloadCategory;
  pageSection?: string;
  groupLabel?: string;
  departmentId?: number;
  isActive?: boolean;
}

/**
 * Publishes many documents at once, sharing category/page/group across them.
 * Files must already be in the Media Library - upload them with
 * bulkUploadMedia first, then pass the resulting ids here.
 */
export function bulkCreateDownloads(dto: BulkDownloadsInput): Promise<Download[]> {
  return apiPost<Download[]>("/downloads/bulk", dto);
}

export function updateDownload(
  id: number,
  dto: Partial<DownloadInput> & { version: number },
): Promise<Download> {
  return apiPatch<Download>(`/downloads/${id}`, dto);
}

export function deleteDownload(id: number): Promise<Download> {
  return apiDelete<Download>(`/downloads/${id}`);
}

export function restoreDownload(id: number): Promise<Download> {
  return apiPost<Download>(`/downloads/${id}/restore`);
}

export function reorderDownloads(items: { id: number; sortOrder: number }[]): Promise<Download[]> {
  return apiPatch<Download[]>("/downloads/reorder", { items });
}

/**
 * Group headings that a page actually renders as its own block.
 *
 * The group label is free text, and that is deliberate - a page can grow a new
 * heading without a code change. But several pages bind a *specific* heading to
 * a designed block, and typing it differently silently drops the document into
 * the page's catch-all list instead. These are those headings, offered as
 * suggestions so the binding ones can be picked rather than remembered.
 */
export const GROUP_SUGGESTIONS: Record<string, string[]> = {
  about: [
    "Joint Board of Studies",
    "Strategic Plan & Deployment Documents",
    "Policy Documents",
  ],
  alumni: ["Alumni Meets", "Activity Reports"],
  "mandatory-disclosure": [
    "Accreditation Status",
    "UGC Autonomous",
    "Other Statutory Documents",
  ],
};
