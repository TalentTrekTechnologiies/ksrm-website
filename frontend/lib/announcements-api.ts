import { apiGet, apiPatch, apiPost, apiDelete } from "./api-client"

export type AnnouncementPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW"
export type AnnouncementSource =
  | "NEWS"
  | "EXAM_NOTIFICATION"
  | "EVENT"
  | "PLACEMENT"
  | "ADMISSION"
  | "MANUAL"
  | "EMERGENCY"
export type AnnouncementLocation =
  | "HEADER_TICKER"
  | "HERO_BANNER"
  | "HOMEPAGE_SECTION"
  | "DEPARTMENT_PAGE"
  | "ADMISSIONS_PAGE"
  | "PLACEMENTS_PAGE"
  | "EXAM_NOTIFICATIONS_PAGE"

export const ANNOUNCEMENT_LOCATIONS: { value: AnnouncementLocation; label: string }[] = [
  { value: "HEADER_TICKER", label: "Header Ticker" },
  { value: "HERO_BANNER", label: "Hero Banner (unused)" },
  { value: "HOMEPAGE_SECTION", label: "Homepage Section (unused)" },
  { value: "DEPARTMENT_PAGE", label: "Department Page (unused)" },
  { value: "ADMISSIONS_PAGE", label: "Admissions Page (unused)" },
  { value: "PLACEMENTS_PAGE", label: "Placements Page (unused)" },
  { value: "EXAM_NOTIFICATIONS_PAGE", label: "Exam Notifications Page (unused)" },
]

export const ANNOUNCEMENT_PRIORITIES: { value: AnnouncementPriority; label: string }[] = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "NORMAL", label: "Normal" },
  { value: "LOW", label: "Low" },
]

export interface AnnouncementPlacementItem {
  id: number
  location: AnnouncementLocation
  departmentId: number | null
  department?: { id: number; name: string } | null
  sortOrder: number
}

export interface Announcement {
  id: number
  title: string
  shortText: string | null
  description: string | null
  icon: string | null
  badge: string | null
  priority: AnnouncementPriority
  color: string | null
  source: AnnouncementSource
  sourceModule: string | null
  sourceRecordId: number | null
  linkUrl: string | null
  openInNewTab: boolean
  startDate: string | null
  endDate: string | null
  isPublished: boolean
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  deletedBy: number | null
  version: number
  placements: AnnouncementPlacementItem[]
}

export interface AnnouncementPlacementInput {
  location: AnnouncementLocation
  departmentId?: number
}

export interface AnnouncementInput {
  title: string
  shortText?: string
  description?: string
  icon?: string
  badge?: string
  priority?: AnnouncementPriority
  color?: string
  source?: AnnouncementSource
  sourceModule?: string
  sourceRecordId?: number
  linkUrl?: string
  openInNewTab?: boolean
  startDate?: string
  endDate?: string
  isPublished?: boolean
  sortOrder?: number
  isActive?: boolean
  placements: AnnouncementPlacementInput[]
}

// Public - no visibility wrapper, just the already-filtered (published,
// active, in-window, matching location/department) array.
export function getAnnouncementsPublic(
  location: AnnouncementLocation,
  departmentId?: number,
): Promise<Announcement[]> {
  const params = new URLSearchParams({ location })
  if (departmentId !== undefined) params.set("departmentId", String(departmentId))
  return apiGet<Announcement[]>(`/announcements?${params.toString()}`)
}

// --- Admin ---

export interface QueryAnnouncementsAdmin {
  search?: string
  location?: AnnouncementLocation
  includeDeleted?: boolean
  page?: number
  pageSize?: number
}

export interface AnnouncementListResponse {
  items: Announcement[]
  total: number
  page: number
  pageSize: number
}

function buildQuery(query: QueryAnnouncementsAdmin): string {
  const params = new URLSearchParams()
  if (query.search) params.set("search", query.search)
  if (query.location) params.set("location", query.location)
  if (query.includeDeleted) params.set("includeDeleted", "true")
  if (query.page !== undefined) params.set("page", String(query.page))
  if (query.pageSize !== undefined) params.set("pageSize", String(query.pageSize))
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export function getAnnouncementsAdmin(
  query: QueryAnnouncementsAdmin = {},
): Promise<AnnouncementListResponse> {
  return apiGet<AnnouncementListResponse>(`/announcements/admin${buildQuery(query)}`)
}

export function getAnnouncement(id: number): Promise<Announcement> {
  return apiGet<Announcement>(`/announcements/admin/${id}`)
}

export function createAnnouncement(dto: AnnouncementInput): Promise<Announcement> {
  return apiPost<Announcement>("/announcements/admin", dto)
}

export function updateAnnouncement(
  id: number,
  dto: Partial<AnnouncementInput> & { version: number },
): Promise<Announcement> {
  return apiPatch<Announcement>(`/announcements/admin/${id}`, dto)
}

export function publishAnnouncement(id: number): Promise<Announcement> {
  return apiPost<Announcement>(`/announcements/admin/${id}/publish`)
}

export function unpublishAnnouncement(id: number): Promise<Announcement> {
  return apiPost<Announcement>(`/announcements/admin/${id}/unpublish`)
}

export function deleteAnnouncement(id: number): Promise<Announcement> {
  return apiDelete<Announcement>(`/announcements/admin/${id}`)
}

export function restoreAnnouncement(id: number): Promise<Announcement> {
  return apiPost<Announcement>(`/announcements/admin/${id}/restore`)
}
