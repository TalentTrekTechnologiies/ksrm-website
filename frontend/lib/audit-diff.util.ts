import { formatFieldValue, humanField } from "./audit-describe";

// Fields present on every content row that are never meaningful to show in
// a "what changed" diff - internal bookkeeping, not editorial content.
const IGNORED_FIELDS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "deletedBy",
  "version",
  "checksumSha256",
  "storageKey",
]);

export interface FieldDiff {
  field: string;
  /** Plain-language field name, e.g. "Visible on site" for isActive. */
  label: string;
  oldValue: string;
  newValue: string;
}

/**
 * Computes a field-level Old/New diff table from an audit log entry's
 * {before, after} snapshot, for the Audit History drawer and the Audit Logs
 * page - an editor reading "Title: ABC -> XYZ" is far easier to scan than a
 * raw JSON blob.
 *
 * Names and values render through the shared audit formatters, so a boolean
 * reads "Visible"/"Hidden" rather than true/false and a long media URL shows
 * the filename rather than 90 characters of path.
 */
export function computeFieldDiff(
  before: Record<string, unknown> | undefined,
  after: Record<string, unknown> | undefined,
): FieldDiff[] {
  if (!before || !after) return [];

  const fields = new Set([...Object.keys(before), ...Object.keys(after)]);
  const diffs: FieldDiff[] = [];

  for (const field of fields) {
    if (IGNORED_FIELDS.has(field)) continue;
    const oldValue = before[field];
    const newValue = after[field];
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) continue;

    // Some modules store a section's editable text as one nested JSON object
    // (homepage sections keep {heading, eyebrow, text, ...} under `content`).
    // Diffing it whole would print two walls of JSON and leave the reader to
    // spot the difference, so recurse and report the inner fields that moved.
    if (isPlainObject(oldValue) && isPlainObject(newValue)) {
      const parent = humanField(field);
      for (const inner of computeFieldDiff(oldValue, newValue)) {
        diffs.push({ ...inner, field: `${field}.${inner.field}`, label: `${parent} → ${inner.label}` });
      }
      continue;
    }

    diffs.push({
      field,
      label: humanField(field),
      oldValue: formatFieldValue(field, oldValue),
      newValue: formatFieldValue(field, newValue),
    });
  }

  return diffs;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
