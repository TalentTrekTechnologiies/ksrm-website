// Plain-language rendering for audit entries. The database stores technical
// verbs (CREATE/UPDATE/DELETE) and snake_case module keys (site_settings,
// career_applications) - correct for querying, wrong for reading. Everything
// that shows audit data to a person (Audit Logs page, dashboard Recent
// Activity) renders through these two functions so the wording stays
// identical everywhere.

const ACTION_LABELS: Record<string, string> = {
  CREATE: "Added",
  UPDATE: "Edited",
  DELETE: "Deleted",
  RESTORE: "Restored",
  PUBLISH: "Published",
  UNPUBLISH: "Unpublished",
  REORDER: "Reordered",
  REPLACE: "Replaced file",
  ROLLBACK: "Rolled back",
  CROP: "Cropped image",
  RESET_PASSWORD: "Reset password",
  ASSIGN_ROLES: "Changed roles",
  ENABLE: "Enabled",
  DISABLE: "Disabled",
  LOGIN: "Signed in",
};

/** "CREATE" -> "Added". Unknown verbs fall back to Title Case, never raw caps. */
export function humanAction(action: string): string {
  return ACTION_LABELS[action] ?? titleCase(action);
}

/** Lowercase variant for building sentences: "Suresh edited News". */
export function humanActionLower(action: string): string {
  return humanAction(action).toLowerCase();
}

// Curated names where mechanical Title Case reads wrong or the admin UI uses
// different wording than the model (downloads is labelled "Documents" in the
// sidebar, so the log must say Documents too).
const MODULE_LABELS: Record<string, string> = {
  site_settings: "Site Settings",
  career_applications: "Job Applications",
  exam_notifications: "Exam Notifications",
  admin_notifications: "Notifications",
  downloads: "Documents",
  learning_outcomes: "Outcomes (PEO/PO/PSO)",
  department_programmes: "Programmes",
  department_highlights: "Highlights",
  department_display_settings: "Display Settings",
  contact_channels: "Contact Info",
  campus_videos: "Campus Videos",
  quick_links: "Quick Links",
  media_folders: "Media Folders",
  accreditation_badges: "Accreditation Badges",
  admission_programs: "Admission Programs",
  section_visibility: "Section Visibility",
};

/** "career_applications" -> "Job Applications"; unknown keys get Title Case. */
export function humanModule(module: string): string {
  return MODULE_LABELS[module] ?? titleCase(module);
}

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
