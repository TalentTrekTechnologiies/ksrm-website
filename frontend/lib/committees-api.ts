import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export type CommitteeType = "ANTI_RAGGING" | "GRIEVANCE_REDRESSAL" | "GOVERNING_BODY" | "IQAC" | "OTHER";

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

export function getCommitteesAdmin(includeDeleted = false): Promise<Committee[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<Committee[]>(`/committees/admin${query}`);
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
