// Fields present on every content row that are never meaningful to show in
// a "what changed" diff - internal bookkeeping, not editorial content.
const IGNORED_FIELDS = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "deletedBy",
  "version",
]);

export interface FieldDiff {
  field: string;
  oldValue: string;
  newValue: string;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

/**
 * Computes a field-level Old/New diff table from an audit log entry's
 * {before, after} snapshot, for the Audit History drawer - an editor reading
 * "Title: ABC -> XYZ" is far easier to scan than a raw JSON blob.
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
    diffs.push({ field, oldValue: formatValue(oldValue), newValue: formatValue(newValue) });
  }

  return diffs;
}
