import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export type CommitteeType = "ANTI_RAGGING" | "GRIEVANCE_REDRESSAL" | "GOVERNING_BODY" | "IQAC" | "OTHER";

/**
 * Which public page lists a committee, chosen in the CMS.
 *
 * `type` covers the five committees that have a section built for them by
 * name. Anything else - an Internal Complaint Committee, an SC/ST Cell - used
 * to have nowhere to go: it saved as OTHER and rendered on no page. null means
 * "not published on a page yet".
 */
export type CommitteePlacement = "ABOUT" | "IQAC" | "GRIEVANCE" | "ANTI_RAGGING" | "CAMPUS_LIFE";

export interface CommitteeMember {
  id: number;
  committeeId: number;
  facultyId: number | null;
  name: string;
  designation: string;
  role: string;
  sortOrder: number;
  isActive: boolean;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface Committee {
  id: number;
  name: string;
  type: CommitteeType;
  description: string | null;
  sortOrder: number;
  placement: CommitteePlacement | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
  members: CommitteeMember[];
}

export interface CommitteeInput {
  name: string;
  type: CommitteeType;
  description?: string | null;
  placement?: CommitteePlacement | null;
  isActive?: boolean;
}

export interface CommitteeMemberInput {
  name: string;
  designation: string;
  role: string;
  facultyId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

export function getCommitteesPublic(type?: CommitteeType): Promise<Committee[]> {
  const query = type ? `?type=${type}` : "";
  return apiGet<Committee[]>(`/committees${query}`);
}

/** Every committee the CMS has pointed at one page, in drag order. */
export function getCommitteesByPlacement(placement: CommitteePlacement): Promise<Committee[]> {
  return apiGet<Committee[]>(`/committees?placement=${placement}`);
}

export function getCommitteesAdmin(includeDeleted = false): Promise<Committee[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<Committee[]>(`/committees/admin${query}`);
}

/**
 * Both reorder calls take the COMPLETE list of ids in its new order, not just
 * the rows that moved - array position becomes sortOrder, so a partial list
 * would renumber those rows from 0 and collide with the ones left out. The
 * backend rejects a partial list rather than accepting it.
 *
 * Each returns the full admin list, already in its new order, so the caller
 * can replace its state with the server's answer instead of trusting its own.
 */
export function reorderCommittees(ids: number[]): Promise<Committee[]> {
  return apiPost<Committee[]>("/committees/reorder", { ids });
}

export function reorderCommitteeMembers(committeeId: number, ids: number[]): Promise<Committee[]> {
  return apiPost<Committee[]>(`/committees/${committeeId}/members/reorder`, { ids });
}

export function createCommittee(dto: CommitteeInput): Promise<Committee> {
  return apiPost<Committee>("/committees", dto);
}

export function updateCommittee(
  id: number,
  dto: Partial<CommitteeInput> & { version: number },
): Promise<Committee> {
  return apiPatch<Committee>(`/committees/${id}`, dto);
}

export function deleteCommittee(id: number): Promise<Committee> {
  return apiDelete<Committee>(`/committees/${id}`);
}

export function restoreCommittee(id: number): Promise<Committee> {
  return apiPost<Committee>(`/committees/${id}/restore`);
}

export function createCommitteeMember(committeeId: number, dto: CommitteeMemberInput): Promise<CommitteeMember> {
  return apiPost<CommitteeMember>(`/committees/${committeeId}/members`, dto);
}

export function updateCommitteeMember(
  id: number,
  dto: Partial<CommitteeMemberInput> & { version: number },
): Promise<CommitteeMember> {
  return apiPatch<CommitteeMember>(`/committees/members/${id}`, dto);
}

export function deleteCommitteeMember(id: number): Promise<CommitteeMember> {
  return apiDelete<CommitteeMember>(`/committees/members/${id}`);
}

export function restoreCommitteeMember(id: number): Promise<CommitteeMember> {
  return apiPost<CommitteeMember>(`/committees/members/${id}/restore`);
}
