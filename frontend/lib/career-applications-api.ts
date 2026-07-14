import { apiGet, apiPatch, apiPost } from "./api-client"
import { xhrUpload } from "./media-api"
import { getToken } from "./auth"

export type ApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEW_COMPLETED"
  | "SELECTED"
  | "REJECTED"
  | "JOINED"

export const APPLICATION_STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: "APPLIED", label: "Applied" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW_SCHEDULED", label: "Interview Scheduled" },
  { value: "INTERVIEW_COMPLETED", label: "Interview Completed" },
  { value: "SELECTED", label: "Selected" },
  { value: "REJECTED", label: "Rejected" },
  { value: "JOINED", label: "Joined" },
]

export interface CareerApplication {
  id: number
  careerId: number | null
  career?: { id: number; title: string } | null
  fullName: string
  email: string
  mobile: string
  address: string | null
  dateOfBirth: string | null
  qualification: string
  specialization: string | null
  yearsOfExperience: number | null
  currentCompany: string | null
  currentCtc: string | null
  expectedCtc: string | null
  noticePeriod: string | null
  skills: string[]
  linkedinUrl: string | null
  portfolioUrl: string | null
  resumeMediaId: number
  resumeUrl: string
  coverLetter: string | null
  additionalNotes: string | null
  source: "WEBSITE" | "REFERRAL" | "MANUAL"
  status: ApplicationStatus
  notes: string | null
  assignedHrId: number | null
  assignedHr?: { id: number; name: string; email: string } | null
  createdAt: string
  updatedAt: string
}

export interface CareerApplicationStatusHistoryEntry {
  id: number
  status: ApplicationStatus
  note: string | null
  createdAt: string
  changedByAdmin: { id: number; name: string } | null
}

export interface CareerApplicationDetail extends CareerApplication {
  statusHistory: CareerApplicationStatusHistoryEntry[]
}

export interface SubmitCareerApplicationInput {
  careerId?: number
  fullName: string
  email: string
  mobile: string
  address?: string
  dateOfBirth?: string
  qualification: string
  specialization?: string
  yearsOfExperience?: number
  currentCompany?: string
  currentCtc?: string
  expectedCtc?: string
  noticePeriod?: string
  skills?: string[]
  linkedinUrl?: string
  portfolioUrl?: string
  coverLetter?: string
  additionalNotes?: string
  resume: File
}

// Public - no auth token needed (xhrUpload only attaches one if a session
// happens to exist, which is harmless either way). The resume upload and
// the application record are created in one request; the backend handles
// wiring the file into the Media Library internally.
export function submitCareerApplication(
  input: SubmitCareerApplicationInput,
  onProgress?: (percent: number) => void,
): Promise<CareerApplication> {
  const formData = new FormData()
  const { resume, skills, ...fields } = input
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, String(value))
    }
  }
  if (skills && skills.length > 0) formData.append("skills", skills.join(","))
  formData.append("resume", resume)

  return xhrUpload<CareerApplication>(
    "POST",
    "/career-applications",
    formData,
    onProgress,
  )
}

// --- Admin ---

export interface QueryCareerApplications {
  search?: string
  status?: ApplicationStatus
  careerId?: number
  assignedHrId?: number
  from?: string
  to?: string
  page?: number
  pageSize?: number
}

export interface CareerApplicationListResponse {
  items: CareerApplication[]
  total: number
  page: number
  pageSize: number
}

function buildQuery(query: QueryCareerApplications): string {
  const params = new URLSearchParams()
  if (query.search) params.set("search", query.search)
  if (query.status) params.set("status", query.status)
  if (query.careerId !== undefined) params.set("careerId", String(query.careerId))
  if (query.assignedHrId !== undefined) params.set("assignedHrId", String(query.assignedHrId))
  if (query.from) params.set("from", query.from)
  if (query.to) params.set("to", query.to)
  if (query.page !== undefined) params.set("page", String(query.page))
  if (query.pageSize !== undefined) params.set("pageSize", String(query.pageSize))
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

export function getCareerApplicationsAdmin(
  query: QueryCareerApplications = {},
): Promise<CareerApplicationListResponse> {
  return apiGet<CareerApplicationListResponse>(`/career-applications/admin${buildQuery(query)}`)
}

export function getCareerApplication(id: number): Promise<CareerApplicationDetail> {
  return apiGet<CareerApplicationDetail>(`/career-applications/admin/${id}`)
}

export function updateApplicationNotes(id: number, notes: string): Promise<CareerApplication> {
  return apiPatch<CareerApplication>(`/career-applications/admin/${id}/notes`, { notes })
}

export function updateApplicationStatus(
  id: number,
  status: ApplicationStatus,
  note?: string,
): Promise<CareerApplication> {
  return apiPost<CareerApplication>(`/career-applications/admin/${id}/status`, { status, note })
}

export function assignApplicationHr(id: number, adminId: number): Promise<CareerApplication> {
  return apiPost<CareerApplication>(`/career-applications/admin/${id}/assign-hr`, { adminId })
}

export interface CareerApplicationDashboardCounts {
  applicationsToday: number
  applicationsThisWeek: number
  pendingReview: number
  shortlisted: number
  selected: number
}

export function getCareerApplicationDashboardCounts(): Promise<CareerApplicationDashboardCounts> {
  return apiGet<CareerApplicationDashboardCounts>("/career-applications/admin/dashboard-counts")
}

function authedDownload(path: string, filename: string) {
  // Exports/resume downloads return a file body, not JSON - apiGet always
  // parses JSON, so this does its own fetch with the auth header, same
  // approach as downloadAuditLogsCsv in audit-logs-api.ts.
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4000"
  const token = getToken()
  return fetch(`${API_BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Download failed (${res.status})`)
      return res.blob()
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    })
}

export function downloadApplicationResume(id: number, applicantName: string) {
  return authedDownload(
    `/career-applications/admin/${id}/resume`,
    `${applicantName.replace(/[^a-z0-9]/gi, "_")}_resume`,
  )
}

export function exportCareerApplicationsCsv(query: QueryCareerApplications = {}) {
  return authedDownload(
    `/career-applications/admin/export/csv${buildQuery(query)}`,
    "career-applications.csv",
  )
}

export function exportCareerApplicationsExcel(query: QueryCareerApplications = {}) {
  return authedDownload(
    `/career-applications/admin/export/excel${buildQuery(query)}`,
    "career-applications.xlsx",
  )
}
