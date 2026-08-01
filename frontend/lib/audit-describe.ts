// Turns a raw audit row into something a person can read.
//
// The database stores an entry as {module, action, targetId, details} where
// details is a JSON snapshot - correct for an audit trail, unreadable in a UI.
// A reviewer wants to know *who* changed *what record* on *which page*, and
// what actually differed. These helpers derive exactly that, so the Audit Logs
// page never has to show a JSON blob to explain itself.
//
// Everything here is derived from the stored snapshot. Nothing new is logged
// and no extra request is made - so it works on the 1,600+ entries already
// recorded, not just on entries created from now on.

import { PAGE_SECTIONS } from "./downloads-api";
import { humanActionLower, humanModule } from "./audit-humanize";

export interface AuditEntryLike {
  module: string;
  action: string;
  targetId: number | null;
  details: string | null;
  adminName?: string;
}

/** Parsed snapshot: `after` for creates/updates, `before` for deletes. */
export interface AuditSnapshot {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  /** The record itself, when the entry stored a bare object rather than a pair. */
  flat?: Record<string, unknown>;
  /**
   * The whole parsed payload. Some modules put the identifier beside the
   * before/after pair rather than inside it - section visibility logs
   * `{before, after, section: "recruiters"}` - so naming has to look here too.
   */
  root: Record<string, unknown>;
  changedFields?: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseSnapshot(details: string | null): AuditSnapshot | null {
  if (!details) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(details);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const obj = parsed as Record<string, unknown>;
  const before = isRecord(obj.before) ? obj.before : undefined;
  const after = isRecord(obj.after) ? obj.after : undefined;
  const changedFields = Array.isArray(obj.changedFields) ? (obj.changedFields as string[]) : undefined;
  // Some actions (PUBLISH, ENABLE, REORDER, CROP) log a bare payload instead
  // of a before/after pair - keep it so the modal can still describe them.
  const flat = before || after ? undefined : obj;
  return { before, after, flat, root: obj, changedFields };
}

/** The record's state to describe: what it became, or what it was when deleted. */
export function subjectOf(snap: AuditSnapshot | null): Record<string, unknown> | null {
  if (!snap) return null;
  return snap.after ?? snap.before ?? snap.flat ?? null;
}

// Fields that carry a record's human name, best first. Modules differ
// (placements name the student, site settings are keyed, media keeps the
// uploaded filename), so this is one ordered sweep rather than a per-module map.
const NAME_KEYS = [
  "title",
  "name",
  "heading",
  "studentName",
  "label",
  "question",
  "originalFilename",
  "filename",
  "fileName",
  "code",
  "key",
  "sectionKey",
  "slug",
  "company",
];

/**
 * What the change was made to - "Sri. M. Balanna", "Hero Banner", "Library".
 * Falls back to a numbered record so a row is never blank.
 */
export function describeRecord(entry: AuditEntryLike): string {
  const snap = parseSnapshot(entry.details);
  const subject = subjectOf(snap);
  // The record's own fields first, then the payload's own keys - entries like
  // section visibility name the target beside the before/after pair.
  for (const source of [subject, snap?.root]) {
    if (!source) continue;
    for (const key of [...NAME_KEYS, "section", "scope"]) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) return humanKey(value.trim());
    }
  }
  // Reorders carry only the moved rows.
  const items = subject?.items ?? snap?.root?.items;
  if (Array.isArray(items)) return `${items.length} item${items.length === 1 ? "" : "s"}`;
  return entry.targetId !== null ? `#${entry.targetId}` : "—";
}

/** Section/setting keys are slugs; show "Our Recruiters", not "recruiters". */
function humanKey(value: string): string {
  if (!/^[a-z0-9]+([._-][a-z0-9]+)*$/.test(value)) return value;
  return value
    .split(/[._-]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

/** A second line of context - the record's kind or owner, when it adds something. */
export function describeQualifier(entry: AuditEntryLike): string | null {
  const subject = subjectOf(parseSnapshot(entry.details));
  if (!subject) return null;
  const designation = subject.designation;
  if (typeof designation === "string" && designation.trim()) return designation.trim();
  const type = subject.type;
  if (typeof type === "string" && type.trim()) return type.trim();
  return null;
}

const PAGE_LABELS = new Map(PAGE_SECTIONS.map((s) => [s.value, s.label]));

/**
 * Where on the site the change lands: the public page, or the department that
 * owns the record. `deptNames` resolves the departmentId-only modules (labs,
 * outcomes, highlights) to a real department name.
 */
export function describeLocation(
  entry: AuditEntryLike,
  deptNames?: Map<number, string>,
): string | null {
  // Homepage modules are named for the section they edit.
  if (entry.module.startsWith("homepage_")) {
    const section = humanModule(entry.module.replace(/^homepage_/, "").replace(/^section_/, ""));
    return `Homepage → ${section}`;
  }

  const snap = parseSnapshot(entry.details);
  const subject = subjectOf(snap);
  if (!subject) return null;

  const pageSection = subject.pageSection ?? snap?.root?.pageSection;
  if (typeof pageSection === "string" && pageSection) {
    return `${PAGE_LABELS.get(pageSection) ?? humanModule(pageSection)} page`;
  }

  const department = subject.department;
  if (typeof department === "string" && department.trim()) return department.trim();

  const departmentId = subject.departmentId;
  if (typeof departmentId === "number") {
    return deptNames?.get(departmentId) ?? `Department #${departmentId}`;
  }

  const category = subject.category;
  if (typeof category === "string" && category && category !== "__video__") {
    return humanModule(category);
  }

  return null;
}

/** One-sentence headline: "Super Administrator added Faculty — Smt. C. Aruna". */
export function summarizeEntry(entry: AuditEntryLike): string {
  const who = entry.adminName?.trim() || "Someone";
  return `${who} ${humanActionLower(entry.action)} ${humanModule(entry.module)} — ${describeRecord(entry)}`;
}

// --- field naming and value formatting -------------------------------------

// Where splitting camelCase would read badly or the admin UI uses other wording.
const FIELD_LABELS: Record<string, string> = {
  isActive: "Visible on site",
  isPublished: "Published",
  isHod: "Head of Department",
  visible: "Visible",
  sortOrder: "Display order",
  photoUrl: "Photo",
  imageUrl: "Image",
  videoUrl: "Video",
  documentUrl: "Document",
  fileUrl: "File",
  logoUrl: "Logo",
  companyLogoUrl: "Company logo",
  aboutVideoUrl: "About video",
  mediaId: "Media file",
  videoMediaId: "Video file",
  documentMediaId: "Document file",
  departmentId: "Department",
  categoryId: "Category",
  pageSection: "Page",
  groupLabel: "Group",
  altText: "Alt text",
  metaTitle: "Meta title",
  metaDescription: "Meta description",
  welcomeMessage: "Welcome message",
  academicYear: "Academic year",
  originalFilename: "File name",
  sizeBytes: "File size",
  mimeType: "File type",
  checksumSha256: "Checksum",
  storageKey: "Storage key",
  processingStatus: "Processing status",
  studentName: "Student",
  cropPreset: "Crop preset",
  testEmailSentTo: "Test email sent to",
};

/** "metaDescription" -> "Meta description"; curated names win. */
export function humanField(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  const spaced = field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim()
    .toLowerCase();
  return spaced ? spaced[0].toUpperCase() + spaced.slice(1) : field;
}

// Booleans mean different things per field; "true" tells a reader nothing.
const BOOL_WORDS: Record<string, [string, string]> = {
  isActive: ["Visible", "Hidden"],
  isPublished: ["Published", "Draft"],
  visible: ["Shown", "Hidden"],
  isHod: ["Yes — head of department", "No"],
  isSuperAdmin: ["Yes", "No"],
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/;

/** Renders a stored value the way an admin would say it. */
export function formatFieldValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";

  if (typeof value === "boolean") {
    const words = BOOL_WORDS[field];
    return words ? (value ? words[0] : words[1]) : value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    if (field === "sizeBytes") return formatBytes(value);
    return String(value);
  }

  if (typeof value === "string") {
    if (ISO_DATE.test(value)) {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
      }
    }
    // Long URLs say nothing; the file at the end of them does.
    if (/^(https?:\/\/|\/)/.test(value) && value.length > 40) {
      const tail = decodeURIComponent(value.split("?")[0].split("/").filter(Boolean).pop() ?? value);
      return tail || value;
    }
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (value.every((v) => typeof v === "string" || typeof v === "number")) return value.join(", ");
    return `${value.length} item${value.length === 1 ? "" : "s"}`;
  }

  return JSON.stringify(value);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let v = bytes / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
}

// Bookkeeping an editor never changes and never needs to read.
const NOISE_FIELDS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "deletedBy",
  "version",
  "checksumSha256",
  "storageKey",
  "passwordHash",
  "password",
]);

export interface FieldValue {
  field: string;
  label: string;
  value: string;
}

/**
 * A record's contents as label/value rows, for the created- and deleted-record
 * views where there is no "before" to diff against. Empty fields are dropped -
 * a create logs every column, and listing 20 dashes buries the 6 that matter.
 */
export function describeFields(obj: Record<string, unknown> | null | undefined): FieldValue[] {
  if (!obj) return [];
  return Object.entries(obj)
    .filter(([field, value]) => !NOISE_FIELDS.has(field) && value !== null && value !== undefined && value !== "")
    .map(([field, value]) => ({ field, label: humanField(field), value: formatFieldValue(field, value) }));
}
