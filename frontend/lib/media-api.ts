import { getToken, clearSession } from "./auth"
import { apiDelete, apiGet, apiPatch, apiPost, ApiError } from "./api-client"
import { API_BASE } from "./api-base"

// Resolved centrally (api-base.ts) - a bare `|| "http://localhost:4000"` here
// pointed every production media URL at the visitor's own machine.
const API_BASE_URL = API_BASE

export type MediaType = "IMAGE" | "VIDEO" | "DOCUMENT"
export type MediaProcessingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"

export interface MediaVariant {
  variant: string
  format: "SOURCE" | "WEBP"
  cropPreset: string | null
  width: number | null
  height: number | null
  sizeBytes: string
  url: string
}

export interface Media {
  id: number
  type: MediaType
  originalFilename: string
  mimeType: string
  extension: string
  sizeBytes: string
  checksumSha256: string
  width: number | null
  height: number | null
  durationSeconds: number | null
  codec: string | null
  bitrateKbps: number | null
  processingStatus: MediaProcessingStatus
  processingError: string | null
  title: string | null
  altText: string | null
  caption: string | null
  description: string | null
  copyright: string | null
  photographer: string | null
  folderId: number | null
  category: string | null
  /** Also serves as the SEO "Keywords" field in the metadata panel. */
  tags: string[]
  uploadedByAdminId: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  deletedBy: number | null
  version: number
  variants: MediaVariant[]
}

export interface MediaFolder {
  id: number
  name: string
  parentId: number | null
  path: string
  createdAt: string
  updatedAt: string
}

export interface MediaUsage {
  id: number
  mediaId: number
  module: string
  recordId: number
  field: string
  createdAt: string
}

export interface MediaVersion {
  id: number
  mediaId: number
  versionNumber: number
  storageKey: string
  mimeType: string
  sizeBytes: string
  checksumSha256: string
  width: number | null
  height: number | null
  replacedByAdminId: number | null
  createdAt: string
}

export interface MediaStats {
  counts: Record<MediaType, number>
  totalSizeBytes: string
}

export interface MediaFacets {
  categories: string[]
  tags: string[]
}

export interface MediaQuery {
  type?: MediaType
  folderId?: number
  category?: string
  tags?: string[]
  q?: string
  isActive?: boolean
  includeDeleted?: boolean
  page?: number
  pageSize?: number
}

export interface MediaListResult {
  items: Media[]
  total: number
  page: number
  pageSize: number
}

export interface UploadMediaFields {
  title?: string
  altText?: string
  caption?: string
  description?: string
  copyright?: string
  photographer?: string
  folderId?: number
  category?: string
  tags?: string[]
}

export interface BulkUploadResult {
  results: Array<{
    originalFilename: string
    success: boolean
    deduplicated?: boolean
    media?: Media
    error?: string
  }>
}

export interface BulkDeleteResult {
  results: Array<{ id: number; success: boolean; error?: string }>
}

function buildQueryString(query: MediaQuery): string {
  const params = new URLSearchParams()
  if (query.type) params.set("type", query.type)
  if (query.folderId !== undefined) params.set("folderId", String(query.folderId))
  if (query.category) params.set("category", query.category)
  if (query.tags && query.tags.length > 0) params.set("tags", query.tags.join(","))
  if (query.q) params.set("q", query.q)
  if (query.isActive !== undefined) params.set("isActive", String(query.isActive))
  if (query.includeDeleted !== undefined) params.set("includeDeleted", String(query.includeDeleted))
  if (query.page !== undefined) params.set("page", String(query.page))
  if (query.pageSize !== undefined) params.set("pageSize", String(query.pageSize))
  const qs = params.toString()
  return qs ? `?${qs}` : ""
}

function appendUploadFields(formData: FormData, fields: UploadMediaFields): void {
  if (fields.title) formData.append("title", fields.title)
  if (fields.altText) formData.append("altText", fields.altText)
  if (fields.caption) formData.append("caption", fields.caption)
  if (fields.description) formData.append("description", fields.description)
  if (fields.copyright) formData.append("copyright", fields.copyright)
  if (fields.photographer) formData.append("photographer", fields.photographer)
  if (fields.folderId !== undefined) formData.append("folderId", String(fields.folderId))
  if (fields.category) formData.append("category", fields.category)
  if (fields.tags && fields.tags.length > 0) formData.append("tags", fields.tags.join(","))
}

/**
 * `api-client.ts`'s `apiFetch` hardcodes `Content-Type: application/json`
 * on every request (breaks multipart uploads) and is built on `fetch`,
 * which exposes no upload-progress event. This XHR-based helper is the
 * multipart-aware, progress-capable sibling used only for Media Library
 * uploads - it mirrors `apiFetch`'s auth-header attachment and error
 * normalization (`ApiError`) so callers get the same error shape either way.
 */
// Exported for reuse by other public-facing multipart submissions (e.g.
// career-applications-api.ts's resume upload) - the pattern (auth-header
// attachment when a token exists, ApiError normalization, upload progress)
// isn't actually Media-specific, just first built here.
export function xhrUpload<T>(
  method: "POST",
  path: string,
  formData: FormData,
  onProgress?: (percent: number, loadedBytes: number, totalBytes: number) => void,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, `${API_BASE_URL}${path}`)

    const token = getToken()
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`)

    xhr.upload.onprogress = (event) => {
      if (!onProgress || !event.lengthComputable) return
      onProgress(Math.round((event.loaded / event.total) * 100), event.loaded, event.total)
    }

    xhr.onload = () => {
      if (xhr.status === 401) {
        clearSession()
      }

      let body: unknown = undefined
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : undefined
      } catch {
        // Non-JSON body - fall through to the generic error message below.
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as T)
        return
      }

      const errorBody = body as { message?: string | string[]; requestId?: string } | undefined
      const message = Array.isArray(errorBody?.message)
        ? errorBody.message.join(", ")
        : errorBody?.message || xhr.statusText || "Upload failed"
      reject(new ApiError(message, xhr.status, errorBody?.requestId))
    }

    xhr.onerror = () => reject(new ApiError("Network error during upload", 0))

    xhr.send(formData)
  })
}

// --- Media ---

export function getMediaAdmin(query: MediaQuery = {}): Promise<MediaListResult> {
  return apiGet<MediaListResult>(`/media${buildQueryString(query)}`)
}

export function getMediaById(id: number): Promise<Media> {
  return apiGet<Media>(`/media/${id}`)
}

export function getMediaUsages(id: number): Promise<MediaUsage[]> {
  return apiGet<MediaUsage[]>(`/media/${id}/usages`)
}

export function getMediaVersions(id: number): Promise<MediaVersion[]> {
  return apiGet<MediaVersion[]>(`/media/${id}/versions`)
}

export function getMediaFacets(): Promise<MediaFacets> {
  return apiGet<MediaFacets>("/media/meta/facets")
}

export function getMediaStats(): Promise<MediaStats> {
  return apiGet<MediaStats>("/media/meta/stats")
}

export function uploadMedia(
  file: File,
  fields: UploadMediaFields = {},
  onProgress?: (percent: number) => void,
): Promise<{ deduplicated: boolean; media: Media }> {
  const formData = new FormData()
  formData.append("file", file)
  appendUploadFields(formData, fields)
  return xhrUpload("POST", "/media/upload", formData, onProgress ? (p) => onProgress(p) : undefined)
}

export function bulkUploadMedia(
  files: File[],
  fields: UploadMediaFields = {},
  onProgress?: (percent: number) => void,
): Promise<BulkUploadResult> {
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))
  appendUploadFields(formData, fields)
  return xhrUpload("POST", "/media/upload/bulk", formData, onProgress ? (p) => onProgress(p) : undefined)
}

export function updateMedia(
  id: number,
  dto: {
    title?: string
    altText?: string
    caption?: string
    description?: string
    copyright?: string
    photographer?: string
    folderId?: number | null
    category?: string
    tags?: string[]
    isActive?: boolean
    version: number
  },
): Promise<Media> {
  return apiPatch<Media>(`/media/${id}`, dto)
}

export function replaceMedia(
  id: number,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<Media> {
  const formData = new FormData()
  formData.append("file", file)
  return xhrUpload("POST", `/media/${id}/replace`, formData, onProgress ? (p) => onProgress(p) : undefined)
}

export function rollbackMediaVersion(id: number, versionId: number): Promise<Media> {
  return apiPost<Media>(`/media/${id}/versions/${versionId}/rollback`)
}

export function cropMedia(
  id: number,
  dto: { cropPreset: string; x: number; y: number; width: number; height: number },
): Promise<Media> {
  return apiPost<Media>(`/media/${id}/crops`, dto)
}

export function deleteMedia(id: number, force = false): Promise<Media> {
  return apiDelete<Media>(`/media/${id}${force ? "?force=true" : ""}`)
}

export function bulkDeleteMedia(ids: number[], force = false): Promise<BulkDeleteResult> {
  return apiPost<BulkDeleteResult>("/media/bulk-delete", { ids, force })
}

export function restoreMedia(id: number): Promise<Media> {
  return apiPost<Media>(`/media/${id}/restore`)
}

// --- Folders ---

export function getMediaFolders(): Promise<MediaFolder[]> {
  return apiGet<MediaFolder[]>("/media/folders")
}

export function createMediaFolder(dto: { name: string; parentId?: number }): Promise<MediaFolder> {
  return apiPost<MediaFolder>("/media/folders", dto)
}

export function updateMediaFolder(
  id: number,
  dto: { name?: string; parentId?: number | null },
): Promise<MediaFolder> {
  return apiPatch<MediaFolder>(`/media/folders/${id}`, dto)
}

export function deleteMediaFolder(id: number): Promise<void> {
  return apiDelete<void>(`/media/folders/${id}`)
}
