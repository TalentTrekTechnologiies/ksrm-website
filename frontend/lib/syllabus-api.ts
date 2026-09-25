import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";
import type { ProgrammeLevel } from "./department-programmes-api";

/**
 * The headings on Academics -> Syllabus, and the regulations under each.
 *
 * These were three groups written into the page with their regulations in a
 * const array beside them, so renaming "B.Tech (UG)" or adding BCA needed a
 * developer. They are content now.
 */
export interface SyllabusRegulation {
  id: number;
  programmeId: number;
  /** Matched against uploaded filenames, so it is the exact text in them. */
  code: string;
  /** What the page shows. Falls back to the code when blank. */
  label: string | null;
  sortOrder: number;
  isActive: boolean;
  deletedAt: string | null;
  version: number;
}

export interface SyllabusProgramme {
  id: number;
  name: string;
  /** Which branches are listed. Null lists none, for a course with no
   *  specialisations. */
  level: ProgrammeLevel | null;
  /** Narrows those branches by name - MBA and M.Tech are both PG. */
  nameContains: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  deletedAt: string | null;
  version: number;
  regulations: SyllabusRegulation[];
}

export interface SyllabusProgrammeInput {
  name: string;
  level?: ProgrammeLevel | null;
  nameContains?: string | null;
  description?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface SyllabusRegulationInput {
  code: string;
  label?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

const BASE = "/syllabus-programmes";

export const getSyllabusProgrammesPublic = () =>
  apiGet<SyllabusProgramme[]>(BASE);

export const getSyllabusProgrammesAdmin = (includeDeleted = false) =>
  apiGet<SyllabusProgramme[]>(
    `${BASE}/admin${includeDeleted ? "?includeDeleted=true" : ""}`,
  );

export const createSyllabusProgramme = (input: SyllabusProgrammeInput) =>
  apiPost<SyllabusProgramme>(BASE, input);

export const updateSyllabusProgramme = (
  id: number,
  input: SyllabusProgrammeInput & { version: number },
) => apiPatch<SyllabusProgramme>(`${BASE}/${id}`, input);

export const deleteSyllabusProgramme = (id: number) =>
  apiDelete<SyllabusProgramme>(`${BASE}/${id}`);

export const restoreSyllabusProgramme = (id: number) =>
  apiPost<SyllabusProgramme>(`${BASE}/${id}/restore`, {});

export const reorderSyllabusProgrammes = (
  items: { id: number; sortOrder: number }[],
) => apiPatch<SyllabusProgramme[]>(`${BASE}/reorder`, { items });

export const createSyllabusRegulation = (
  programmeId: number,
  input: SyllabusRegulationInput,
) => apiPost<SyllabusRegulation>(`${BASE}/${programmeId}/regulations`, input);

export const updateSyllabusRegulation = (
  id: number,
  input: SyllabusRegulationInput & { version: number },
) => apiPatch<SyllabusRegulation>(`${BASE}/regulations/${id}`, input);

export const deleteSyllabusRegulation = (id: number) =>
  apiDelete<SyllabusRegulation>(`${BASE}/regulations/${id}`);

export const restoreSyllabusRegulation = (id: number) =>
  apiPost<SyllabusRegulation>(`${BASE}/regulations/${id}/restore`, {});

export const reorderSyllabusRegulations = (
  programmeId: number,
  items: { id: number; sortOrder: number }[],
) =>
  apiPatch<SyllabusProgramme[]>(`${BASE}/${programmeId}/regulations/reorder`, {
    items,
  });

/**
 * What the page shows when the CMS has nothing yet.
 *
 * The three headings the page has always carried, so the migration and the
 * deploy on their own change nothing a visitor sees - the college fills the
 * CMS in its own time, and the page switches over the moment it does.
 */
export const FALLBACK_SYLLABUS_PROGRAMMES: SyllabusProgramme[] = [
  {
    id: -1,
    name: "B.Tech (UG)",
    level: "UG",
    nameContains: null,
    description: null,
    sortOrder: 0,
    isActive: true,
    deletedAt: null,
    version: 1,
    regulations: [
      { code: "R26", label: "R26 (AY 2026-27 intake)" },
      { code: "R23", label: "R23" },
      { code: "R20", label: "R20" },
      { code: "R18", label: "R18" },
      { code: "R15", label: "R15 (Archive)" },
    ].map((r, i) => ({
      id: -(10 + i),
      programmeId: -1,
      code: r.code,
      label: r.label,
      sortOrder: i,
      isActive: true,
      deletedAt: null,
      version: 1,
    })),
  },
  {
    id: -2,
    name: "M.Tech (PG)",
    level: "PG",
    nameContains: "tech",
    description: null,
    sortOrder: 1,
    isActive: true,
    deletedAt: null,
    version: 1,
    regulations: [
      { code: "R22", label: "R22 (Current)" },
      { code: "R18PG", label: "R18PG" },
    ].map((r, i) => ({
      id: -(20 + i),
      programmeId: -2,
      code: r.code,
      label: r.label,
      sortOrder: i,
      isActive: true,
      deletedAt: null,
      version: 1,
    })),
  },
  {
    id: -3,
    name: "MBA",
    level: "PG",
    nameContains: "mba",
    description: null,
    sortOrder: 2,
    isActive: true,
    deletedAt: null,
    version: 1,
    regulations: [
      { code: "R25", label: "R25 (Current)" },
      { code: "R19", label: "R19 (Archive)" },
    ].map((r, i) => ({
      id: -(30 + i),
      programmeId: -3,
      code: r.code,
      label: r.label,
      sortOrder: i,
      isActive: true,
      deletedAt: null,
      version: 1,
    })),
  },
];
