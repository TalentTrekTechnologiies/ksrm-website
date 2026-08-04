import { apiGet, apiPost, apiPatch, apiDelete } from "./api-client";

export interface HeroCaption {
  label: string;
  text: string;
}

export interface HeroNewsTickerItem {
  isNew: boolean;
  date: string;
  text: string;
  href?: string;
}

export interface HomepageHero {
  id: number;
  accreditationLabel: string | null;
  heading: string;
  subtitle: string;
  videoUrl: string;
  /** Media Library reference for the background video, or null when using
   * a manually-typed videoUrl (legacy path, still supported). */
  mediaId: number | null;
  ctaPrimaryText: string | null;
  ctaPrimaryHref: string | null;
  ctaSecondaryText: string | null;
  ctaSecondaryHref: string | null;
  panelLabel: string | null;
  captions: HeroCaption[] | null;
  newsTicker: HeroNewsTickerItem[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

// A distinct input shape, not Omit<HomepageHero, ...> - response fields are
// `string | null` (what Prisma returns), but optional inputs should be
// `string | undefined` (omit the key entirely), matching the backend DTO's
// @IsOptional() fields.
export interface HeroInput {
  accreditationLabel?: string | null;
  heading: string;
  subtitle: string;
  videoUrl: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing videoUrl. */
  mediaId?: number | null;
  ctaPrimaryText?: string | null;
  ctaPrimaryHref?: string | null;
  ctaSecondaryText?: string | null;
  ctaSecondaryHref?: string | null;
  panelLabel?: string | null;
  captions?: HeroCaption[];
  newsTicker?: HeroNewsTickerItem[];
  isActive?: boolean;
}

export type StatisticGroup = "homepage" | "homepage_placements" | "department";

export interface SiteStatistic {
  id: number;
  scope: StatisticGroup;
  /** Set only when scope === "department". */
  departmentId: number | null;
  label: string;
  value: number;
  suffix: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface StatisticInput {
  scope: StatisticGroup;
  /** Required when scope === "department". */
  departmentId?: number;
  label: string;
  value: number;
  suffix?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export type QuickLinkSection = "homepage_quick_links";

export interface QuickLink {
  id: number;
  section: QuickLinkSection;
  icon: string | null;
  imageUrl: string;
  mediaId: number | null;
  title: string;
  description: string | null;
  tags: string[];
  linkUrl: string;
  linkText: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface QuickLinkInput {
  section: QuickLinkSection;
  icon?: string | null;
  imageUrl: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing imageUrl. */
  mediaId?: number | null;
  title: string;
  description?: string | null;
  tags?: string[];
  linkUrl: string;
  linkText?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export type AdmissionProgramSection = "homepage_admission_programs";

// Same shape as QuickLink (both are ContentCard rows) - kept as a distinct
// type alias rather than reusing QuickLink so call sites read clearly and
// the `section` literal type stays accurate for each.
export interface AdmissionProgram {
  id: number;
  section: AdmissionProgramSection;
  icon: string | null;
  imageUrl: string;
  /** Media Library reference, or null when using a manually-typed imageUrl
   * (legacy path, still supported). */
  mediaId: number | null;
  title: string;
  description: string | null;
  tags: string[];
  linkUrl: string;
  linkText: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface AdmissionProgramInput {
  section: AdmissionProgramSection;
  icon?: string | null;
  imageUrl: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing imageUrl. */
  mediaId?: number | null;
  title: string;
  description?: string | null;
  tags: string[];
  linkUrl: string;
  linkText?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

// --- Homepage Sections (Sprint 1B) ---

export type SectionStatus = "DRAFT" | "PUBLISHED";
export type SectionKey = "vision" | "mission" | "about" | "admissions";

export interface VisionContent {
  eyebrow?: string;
  heading: string;
  label: string;
  text: string;
}

export interface MissionItem {
  code: string;
  text: string;
}

export interface MissionContent {
  label: string;
  missions: MissionItem[];
}

export interface AboutStat {
  num: string;
  label: string;
}

export interface AboutHighlight {
  title: string;
  description?: string | null;
}

export interface AboutImage {
  url: string;
  alt: string;
  caption?: string;
}

export interface AboutCta {
  text: string;
  href: string;
}

export interface AboutContent {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  paragraphs: string[];
  highlights?: AboutHighlight[];
  statistics: AboutStat[];
  foundingYear: number;
  image: AboutImage;
  badgeLabel?: string | null;
  cta: AboutCta;
}

export interface HelplinePhone {
  display: string;
  href: string;
}

export interface AdmissionsContent {
  badge: string;
  heading: string;
  subtitle: string;
  helplinePhones: HelplinePhone[];
  helplineEmail: string;
}

export interface HomepageSectionContentMap {
  vision: VisionContent;
  mission: MissionContent;
  about: AboutContent;
  admissions: AdmissionsContent;
}

export interface HomepageSectionRecord<K extends SectionKey = SectionKey> {
  id: number;
  key: K;
  content: HomepageSectionContentMap[K];
  status: SectionStatus;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

// --- Audit history ---

export interface AuditLogEntry {
  id: number;
  adminId: number;
  adminName: string;
  adminEmail: string;
  action: "CREATE" | "UPDATE" | "DELETE" | "RESTORE" | "REORDER" | "PUBLISH" | "UNPUBLISH";
  module: string;
  targetId: number | null;
  details: string | null;
  createdAt: string;
  requestId: string | null;
}

export interface AuditActor {
  adminId: number;
  adminName: string;
  createdAt: string;
}

// --- Section Visibility (Sprint 1C) ---
// The 6 sections built this sprint, and only these - see the Sprint 1C plan
// and feedback_section_visibility memory for why 1A/1B sections aren't
// included yet.
export type SectionVisibilityKey =
  | "testimonials"
  | "campusVideos"
  | "accreditation"
  | "recruiters"
  | "departments"
  | "latestNews";

export interface SectionVisibilityEntry {
  key: SectionVisibilityKey;
  visible: boolean;
}

// Public list endpoints for the 6 Sprint 1C sections return this wrapper
// instead of a bare array - `visible: false` means an admin explicitly
// hid the section (render nothing), which is different from `items: []`
// meaning "temporarily empty, use the hardcoded fallback".
export interface VisibilityWrapped<T> {
  visible: boolean;
  items: T[];
}

// --- Testimonials (Sprint 1C) ---

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string | null;
  quote: string;
  rating: number;
  photoUrl: string | null;
  /** Media Library reference, or null when using a manually-typed photoUrl
   * (legacy path, still supported). */
  mediaId: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface TestimonialInput {
  name: string;
  role: string;
  company?: string | null;
  quote: string;
  rating: number;
  photoUrl?: string | null;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing photoUrl. */
  mediaId?: number | null;
  sortOrder?: number;
  isActive?: boolean;
}

// --- Campus Videos (Sprint 1C) ---

export interface CampusVideo {
  id: number;
  title: string;
  youtubeUrl: string;
  badgeLabel: string | null;
  /** null = homepage's global Campus Videos collection; set = one department's Videos tab. */
  departmentId: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface CampusVideoInput {
  title: string;
  youtubeUrl: string;
  badgeLabel?: string | null;
  departmentId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

// --- Accreditation Badges (Sprint 1C) ---

export interface AccreditationBadge {
  id: number;
  shortName: string;
  grade: string | null;
  name: string;
  subtext: string | null;
  linkUrl: string | null;
  linkText: string | null;
  imageUrl: string;
  mediaId: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface AccreditationBadgeInput {
  shortName: string;
  grade?: string | null;
  name: string;
  subtext?: string | null;
  linkUrl?: string | null;
  linkText?: string | null;
  imageUrl: string;
  mediaId?: number | null;
  sortOrder?: number;
  isActive?: boolean;
}

// --- Recruiters (Sprint 1C) ---

export interface Recruiter {
  id: number;
  name: string;
  logoUrl: string;
  /** Media Library reference, or null when using a manually-typed logoUrl
   * (legacy path, still supported). */
  mediaId: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface RecruiterInput {
  name: string;
  logoUrl: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing logoUrl. */
  mediaId?: number | null;
  sortOrder?: number;
  isActive?: boolean;
}

// --- Department teaser cards (Sprint 1C) ---
// Homepage teaser cards only - deliberately decoupled from the real
// Department entity (bio/faculty/labs). Same ContentCard shape as
// AdmissionProgram, distinct section value.

export type DepartmentCardSection = "homepage_departments";

export interface DepartmentCard {
  id: number;
  section: DepartmentCardSection;
  icon: string | null;
  imageUrl: string;
  mediaId: number | null;
  title: string;
  description: string | null;
  tags: string[];
  linkUrl: string;
  linkText: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: number | null;
  version: number;
}

export interface DepartmentCardInput {
  section: DepartmentCardSection;
  icon?: string | null;
  imageUrl: string;
  /** Pass the picked Media's id to link it; pass `null` explicitly to
   * unlink and fall back to manually editing imageUrl. */
  mediaId?: number | null;
  title: string;
  description?: string | null;
  tags?: string[];
  linkUrl: string;
  linkText?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface HomepagePublicPayload {
  hero: HomepageHero | null;
  statistics: SiteStatistic[];
  placementStatistics: SiteStatistic[];
  quickLinks: QuickLink[];
  admissionPrograms: AdmissionProgram[];
  sections: { [K in SectionKey]: HomepageSectionRecord<K> | null };
  testimonials: Testimonial[];
  campusVideos: CampusVideo[];
  accreditationBadges: AccreditationBadge[];
  recruiters: Recruiter[];
  departments: DepartmentCard[];
}

// --- Public site ---

// The full aggregator - not currently used by any single component
// (Hero/CampusStats/CampusServices/Placements each fetch only their own
// slice below, avoiding four components re-requesting each other's data),
// kept for 1B/1C/1D consumers that do want everything in one call.
export function getHomepagePayload(): Promise<HomepagePublicPayload> {
  return apiGet<HomepagePublicPayload>("/homepage");
}

export function getHeroPublic(): Promise<HomepageHero | null> {
  return apiGet<HomepageHero | null>("/homepage/hero");
}

export function getStatisticsPublic(group: StatisticGroup, departmentId?: number): Promise<SiteStatistic[]> {
  const params = new URLSearchParams({ group });
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  return apiGet<SiteStatistic[]>(`/homepage/statistics?${params.toString()}`);
}

export function getQuickLinksPublic(section: QuickLinkSection): Promise<QuickLink[]> {
  return apiGet<QuickLink[]>(`/homepage/quick-links?section=${section}`);
}

// --- Hero (admin) ---

export function getHeroAdmin(): Promise<HomepageHero | null> {
  return apiGet<HomepageHero | null>("/homepage/admin/hero");
}

export function createHero(dto: HeroInput): Promise<HomepageHero> {
  return apiPost<HomepageHero>("/homepage/admin/hero", dto);
}

export function updateHero(
  dto: Partial<HeroInput> & { version: number },
): Promise<HomepageHero> {
  return apiPatch<HomepageHero>("/homepage/admin/hero", dto);
}

// --- Statistics (admin) ---

export function getStatisticsAdmin(
  group?: StatisticGroup,
  includeDeleted = false,
  departmentId?: number,
): Promise<SiteStatistic[]> {
  const params = new URLSearchParams();
  if (group) params.set("group", group);
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  const query = params.toString();
  return apiGet<SiteStatistic[]>(`/homepage/admin/statistics${query ? `?${query}` : ""}`);
}

export function createStatistic(dto: StatisticInput): Promise<SiteStatistic> {
  return apiPost<SiteStatistic>("/homepage/admin/statistics", dto);
}

export function updateStatistic(
  id: number,
  dto: Partial<StatisticInput> & { version: number },
): Promise<SiteStatistic> {
  return apiPatch<SiteStatistic>(`/homepage/admin/statistics/${id}`, dto);
}

export function deleteStatistic(id: number): Promise<SiteStatistic> {
  return apiDelete<SiteStatistic>(`/homepage/admin/statistics/${id}`);
}

export function restoreStatistic(id: number): Promise<SiteStatistic> {
  return apiPost<SiteStatistic>(`/homepage/admin/statistics/${id}/restore`);
}

export function reorderStatistics(
  scope: StatisticGroup,
  items: { id: number; sortOrder: number }[],
  departmentId?: number,
): Promise<SiteStatistic[]> {
  return apiPatch<SiteStatistic[]>("/homepage/admin/statistics/reorder", { scope, departmentId, items });
}

// --- Quick Links (admin) ---

export function getQuickLinksAdmin(
  section?: QuickLinkSection,
  includeDeleted = false,
): Promise<QuickLink[]> {
  const params = new URLSearchParams();
  if (section) params.set("section", section);
  if (includeDeleted) params.set("includeDeleted", "true");
  const query = params.toString();
  return apiGet<QuickLink[]>(`/homepage/admin/quick-links${query ? `?${query}` : ""}`);
}

export function createQuickLink(dto: QuickLinkInput): Promise<QuickLink> {
  return apiPost<QuickLink>("/homepage/admin/quick-links", dto);
}

export function updateQuickLink(
  id: number,
  dto: Partial<QuickLinkInput> & { version: number },
): Promise<QuickLink> {
  return apiPatch<QuickLink>(`/homepage/admin/quick-links/${id}`, dto);
}

export function deleteQuickLink(id: number): Promise<QuickLink> {
  return apiDelete<QuickLink>(`/homepage/admin/quick-links/${id}`);
}

export function restoreQuickLink(id: number): Promise<QuickLink> {
  return apiPost<QuickLink>(`/homepage/admin/quick-links/${id}/restore`);
}

export function reorderQuickLinks(
  section: QuickLinkSection,
  items: { id: number; sortOrder: number }[],
): Promise<QuickLink[]> {
  return apiPatch<QuickLink[]>("/homepage/admin/quick-links/reorder", { section, items });
}

// --- Admission Programs (admin) ---

export function getAdmissionProgramsPublic(): Promise<AdmissionProgram[]> {
  return apiGet<AdmissionProgram[]>("/homepage/admission-programs?section=homepage_admission_programs");
}

export function getAdmissionProgramsAdmin(includeDeleted = false): Promise<AdmissionProgram[]> {
  const params = new URLSearchParams({ section: "homepage_admission_programs" });
  if (includeDeleted) params.set("includeDeleted", "true");
  return apiGet<AdmissionProgram[]>(`/homepage/admin/admission-programs?${params.toString()}`);
}

export function createAdmissionProgram(dto: AdmissionProgramInput): Promise<AdmissionProgram> {
  return apiPost<AdmissionProgram>("/homepage/admin/admission-programs", dto);
}

export function updateAdmissionProgram(
  id: number,
  dto: Partial<AdmissionProgramInput> & { version: number },
): Promise<AdmissionProgram> {
  return apiPatch<AdmissionProgram>(`/homepage/admin/admission-programs/${id}`, dto);
}

export function deleteAdmissionProgram(id: number): Promise<AdmissionProgram> {
  return apiDelete<AdmissionProgram>(`/homepage/admin/admission-programs/${id}`);
}

export function restoreAdmissionProgram(id: number): Promise<AdmissionProgram> {
  return apiPost<AdmissionProgram>(`/homepage/admin/admission-programs/${id}/restore`);
}

export function reorderAdmissionPrograms(
  items: { id: number; sortOrder: number }[],
): Promise<AdmissionProgram[]> {
  return apiPatch<AdmissionProgram[]>("/homepage/admin/admission-programs/reorder", {
    section: "homepage_admission_programs",
    items,
  });
}

// --- Sections (admin + public) ---

export function getSectionPublic<K extends SectionKey>(key: K): Promise<HomepageSectionRecord<K> | null> {
  return apiGet<HomepageSectionRecord<K> | null>(`/homepage/sections/${key}`);
}

export function getSectionAdmin<K extends SectionKey>(key: K): Promise<HomepageSectionRecord<K>> {
  return apiGet<HomepageSectionRecord<K>>(`/homepage/admin/sections/${key}`);
}

export function updateSection<K extends SectionKey>(
  key: K,
  content: HomepageSectionContentMap[K],
  status: SectionStatus,
  version: number,
): Promise<HomepageSectionRecord<K>> {
  return apiPatch<HomepageSectionRecord<K>>(`/homepage/admin/sections/${key}`, { content, status, version });
}

// --- Audit history (shared by every editor) ---

export function getAuditHistory(module: string, targetId: number): Promise<AuditLogEntry[]> {
  return apiGet<AuditLogEntry[]>(`/audit-logs/target?module=${module}&targetId=${targetId}`);
}

export function getCreatorAndUpdater(
  module: string,
  targetId: number,
): Promise<{ createdBy: AuditActor | null; updatedBy: AuditActor | null }> {
  return apiGet(`/audit-logs/target/creator-updater?module=${module}&targetId=${targetId}`);
}

// --- Section Visibility (admin) ---

export function getSectionVisibility(): Promise<SectionVisibilityEntry[]> {
  return apiGet<SectionVisibilityEntry[]>("/homepage/admin/section-visibility");
}

export function updateSectionVisibility(
  key: SectionVisibilityKey,
  visible: boolean,
): Promise<SectionVisibilityEntry> {
  return apiPatch<SectionVisibilityEntry>(`/homepage/admin/section-visibility/${key}`, { visible });
}

// --- Testimonials ---

export function getTestimonialsPublic(): Promise<VisibilityWrapped<Testimonial>> {
  return apiGet<VisibilityWrapped<Testimonial>>("/homepage/testimonials");
}

export function getTestimonialsAdmin(includeDeleted = false): Promise<Testimonial[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<Testimonial[]>(`/homepage/admin/testimonials${query}`);
}

export function createTestimonial(dto: TestimonialInput): Promise<Testimonial> {
  return apiPost<Testimonial>("/homepage/admin/testimonials", dto);
}

export function updateTestimonial(
  id: number,
  dto: Partial<TestimonialInput> & { version: number },
): Promise<Testimonial> {
  return apiPatch<Testimonial>(`/homepage/admin/testimonials/${id}`, dto);
}

export function deleteTestimonial(id: number): Promise<Testimonial> {
  return apiDelete<Testimonial>(`/homepage/admin/testimonials/${id}`);
}

export function restoreTestimonial(id: number): Promise<Testimonial> {
  return apiPost<Testimonial>(`/homepage/admin/testimonials/${id}/restore`);
}

export function reorderTestimonials(
  items: { id: number; sortOrder: number }[],
): Promise<Testimonial[]> {
  return apiPatch<Testimonial[]>("/homepage/admin/testimonials/reorder", { items });
}

// --- Campus Videos ---

export function getCampusVideosPublic(): Promise<VisibilityWrapped<CampusVideo>> {
  return apiGet<VisibilityWrapped<CampusVideo>>("/homepage/campus-videos");
}

// Not wrapped by the homepage 'campusVideos' section-visibility toggle -
// department page visibility instead goes through DepartmentDisplaySetting.
export function getCampusVideosForDepartment(departmentId: number): Promise<CampusVideo[]> {
  return apiGet<CampusVideo[]>(`/homepage/campus-videos/department/${departmentId}`);
}

export function getCampusVideosAdmin(includeDeleted = false, departmentId?: number): Promise<CampusVideo[]> {
  const params = new URLSearchParams();
  if (departmentId !== undefined) params.set("departmentId", String(departmentId));
  if (includeDeleted) params.set("includeDeleted", "true");
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiGet<CampusVideo[]>(`/homepage/admin/campus-videos${query}`);
}

export function createCampusVideo(dto: CampusVideoInput): Promise<CampusVideo> {
  return apiPost<CampusVideo>("/homepage/admin/campus-videos", dto);
}

export function updateCampusVideo(
  id: number,
  dto: Partial<CampusVideoInput> & { version: number },
): Promise<CampusVideo> {
  return apiPatch<CampusVideo>(`/homepage/admin/campus-videos/${id}`, dto);
}

export function deleteCampusVideo(id: number): Promise<CampusVideo> {
  return apiDelete<CampusVideo>(`/homepage/admin/campus-videos/${id}`);
}

export function restoreCampusVideo(id: number): Promise<CampusVideo> {
  return apiPost<CampusVideo>(`/homepage/admin/campus-videos/${id}/restore`);
}

export function reorderCampusVideos(
  items: { id: number; sortOrder: number }[],
): Promise<CampusVideo[]> {
  return apiPatch<CampusVideo[]>("/homepage/admin/campus-videos/reorder", { items });
}

// --- Accreditation Badges ---

export function getAccreditationBadgesPublic(): Promise<VisibilityWrapped<AccreditationBadge>> {
  return apiGet<VisibilityWrapped<AccreditationBadge>>("/homepage/accreditation-badges");
}

export function getAccreditationBadgesAdmin(includeDeleted = false): Promise<AccreditationBadge[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<AccreditationBadge[]>(`/homepage/admin/accreditation-badges${query}`);
}

export function createAccreditationBadge(dto: AccreditationBadgeInput): Promise<AccreditationBadge> {
  return apiPost<AccreditationBadge>("/homepage/admin/accreditation-badges", dto);
}

export function updateAccreditationBadge(
  id: number,
  dto: Partial<AccreditationBadgeInput> & { version: number },
): Promise<AccreditationBadge> {
  return apiPatch<AccreditationBadge>(`/homepage/admin/accreditation-badges/${id}`, dto);
}

export function deleteAccreditationBadge(id: number): Promise<AccreditationBadge> {
  return apiDelete<AccreditationBadge>(`/homepage/admin/accreditation-badges/${id}`);
}

export function restoreAccreditationBadge(id: number): Promise<AccreditationBadge> {
  return apiPost<AccreditationBadge>(`/homepage/admin/accreditation-badges/${id}/restore`);
}

export function reorderAccreditationBadges(
  items: { id: number; sortOrder: number }[],
): Promise<AccreditationBadge[]> {
  return apiPatch<AccreditationBadge[]>("/homepage/admin/accreditation-badges/reorder", { items });
}

// --- Recruiters ---

export function getRecruitersPublic(): Promise<VisibilityWrapped<Recruiter>> {
  return apiGet<VisibilityWrapped<Recruiter>>("/homepage/recruiters");
}

export function getRecruitersAdmin(includeDeleted = false): Promise<Recruiter[]> {
  const query = includeDeleted ? "?includeDeleted=true" : "";
  return apiGet<Recruiter[]>(`/homepage/admin/recruiters${query}`);
}

export function createRecruiter(dto: RecruiterInput): Promise<Recruiter> {
  return apiPost<Recruiter>("/homepage/admin/recruiters", dto);
}

export function updateRecruiter(
  id: number,
  dto: Partial<RecruiterInput> & { version: number },
): Promise<Recruiter> {
  return apiPatch<Recruiter>(`/homepage/admin/recruiters/${id}`, dto);
}

export function deleteRecruiter(id: number): Promise<Recruiter> {
  return apiDelete<Recruiter>(`/homepage/admin/recruiters/${id}`);
}

export function restoreRecruiter(id: number): Promise<Recruiter> {
  return apiPost<Recruiter>(`/homepage/admin/recruiters/${id}/restore`);
}

export function reorderRecruiters(
  items: { id: number; sortOrder: number }[],
): Promise<Recruiter[]> {
  return apiPatch<Recruiter[]>("/homepage/admin/recruiters/reorder", { items });
}

// --- Department teaser cards ---

export function getDepartmentsPublic(): Promise<VisibilityWrapped<DepartmentCard>> {
  return apiGet<VisibilityWrapped<DepartmentCard>>("/homepage/departments?section=homepage_departments");
}

export function getDepartmentsAdmin(includeDeleted = false): Promise<DepartmentCard[]> {
  const params = new URLSearchParams({ section: "homepage_departments" });
  if (includeDeleted) params.set("includeDeleted", "true");
  return apiGet<DepartmentCard[]>(`/homepage/admin/departments?${params.toString()}`);
}

export function createDepartmentCard(dto: DepartmentCardInput): Promise<DepartmentCard> {
  return apiPost<DepartmentCard>("/homepage/admin/departments", dto);
}

export function updateDepartmentCard(
  id: number,
  dto: Partial<DepartmentCardInput> & { version: number },
): Promise<DepartmentCard> {
  return apiPatch<DepartmentCard>(`/homepage/admin/departments/${id}`, dto);
}

export function deleteDepartmentCard(id: number): Promise<DepartmentCard> {
  return apiDelete<DepartmentCard>(`/homepage/admin/departments/${id}`);
}

export function restoreDepartmentCard(id: number): Promise<DepartmentCard> {
  return apiPost<DepartmentCard>(`/homepage/admin/departments/${id}/restore`);
}

export function reorderDepartmentCards(
  items: { id: number; sortOrder: number }[],
): Promise<DepartmentCard[]> {
  return apiPatch<DepartmentCard[]>("/homepage/admin/departments/reorder", {
    section: "homepage_departments",
    items,
  });
}
