import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export type OutcomeType = "PEO" | "PO" | "PSO";

export interface LearningOutcome {
  id: number;
  departmentId: number;
  type: OutcomeType;
  code: string;
  title: string | null;
  text: string;
  sortOrder: number;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface LearningOutcomeInput {
  departmentId: number;
  type: OutcomeType;
  code: string;
  title?: string;
  text: string;
  sortOrder?: number;
}

export function getLearningOutcomesPublic(departmentId: number, type?: OutcomeType): Promise<LearningOutcome[]> {
  const params = new URLSearchParams({ departmentId: String(departmentId) });
  if (type) params.set("type", type);
  return apiGet<LearningOutcome[]>(`/learning-outcomes?${params.toString()}`);
}

export function getLearningOutcomesAdmin(departmentId?: number, includeDeleted = false): Promise<LearningOutcome[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<LearningOutcome[]>(`/learning-outcomes/admin${query}`);
}

export function createLearningOutcome(dto: LearningOutcomeInput): Promise<LearningOutcome> {
  return apiPost<LearningOutcome>("/learning-outcomes", dto);
}

export function updateLearningOutcome(
  id: number,
  dto: Partial<LearningOutcomeInput> & { version: number },
): Promise<LearningOutcome> {
  return apiPatch<LearningOutcome>(`/learning-outcomes/${id}`, dto);
}

export function deleteLearningOutcome(id: number): Promise<LearningOutcome> {
  return apiDelete<LearningOutcome>(`/learning-outcomes/${id}`);
}

export function restoreLearningOutcome(id: number): Promise<LearningOutcome> {
  return apiPost<LearningOutcome>(`/learning-outcomes/${id}/restore`);
}

export function reorderLearningOutcomes(items: { id: number; sortOrder: number }[]): Promise<LearningOutcome[]> {
  return apiPatch<LearningOutcome[]>("/learning-outcomes/reorder", { items });
}
