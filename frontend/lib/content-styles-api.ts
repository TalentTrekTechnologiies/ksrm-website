import { apiGet, apiPut } from "./api-client";

/**
 * Size and colour for a field of any CMS record.
 *
 * Page Content has had this since the college asked for it, because PageText
 * carries the two columns itself. Every other module stores plain strings, so
 * this is the same feature made general: a module gains it by rendering
 * through <StyledText> and dropping <StyleControls> into its form. No schema
 * change, and no second copy of the logic.
 */
export interface ContentStyle {
  id: number;
  /** The module's audit-log name, e.g. "news", "events", "gallery". */
  module: string;
  recordId: number;
  field: string;
  fontSize: string | null;
  color: string | null;
}

export interface ContentStyleInput {
  module: string;
  recordId: number;
  field: string;
  /** null clears it. Undefined would leave the stored value untouched. */
  fontSize?: string | null;
  color?: string | null;
}

/** Whole-module, not per-record: a list of forty items is one request. */
export function getContentStyles(module?: string): Promise<ContentStyle[]> {
  return apiGet<ContentStyle[]>(`/content-styles${module ? `?module=${encodeURIComponent(module)}` : ""}`);
}

export function saveContentStyles(items: ContentStyleInput[]): Promise<ContentStyle[]> {
  return apiPut<ContentStyle[]>("/content-styles", { items });
}

/** The key both the store and the components address a style by. */
export function styleKey(recordId: number, field: string): string {
  return `${recordId}|${field}`;
}

/**
 * The sizes offered, rather than a free number box.
 *
 * Identical to Page Content's list on purpose: an admin should not meet two
 * different vocabularies for the same thing, and every value here is one the
 * page designs already use. A free box lets someone put 40px in a caption and
 * break a layout.
 */
export const FONT_SIZES: { value: string; label: string }[] = [
  { value: "", label: "Default" },
  { value: "13px", label: "Small" },
  { value: "15px", label: "Normal" },
  { value: "18px", label: "Large" },
  { value: "22px", label: "Extra large" },
  { value: "28px", label: "Heading" },
];
