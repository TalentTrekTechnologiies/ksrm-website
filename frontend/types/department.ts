export interface Mission {
  code: string;
  text: string;
}
export interface PEO {
  code: string;
  text: string;
}
export interface PSO {
  code: string;
  text: string;
}
export interface PO {
  code: string;
  title: string;
  text: string;
}
export interface AIHighlight {
  title: string;
  description: string;
}
export interface HOD {
  name: string;
  designation: string;
  qualification: string;
  message: string[];
  photo: string;
  email: string;
}
export interface FacultyMember {
  name: string;
  designation: string;
  qualification: string;
  photo: string;
  specialization: string;
  experience?: string;
  email?: string;
}
export interface Programme {
  name: string;
  level: string;
  /** Sanctioned intake. Optional - omitted when the figure isn't published. */
  intake?: string;
}
export interface Lab {
  name: string;
  description: string;
  imageUrl: string;
  equipment?: string[];
}
export interface Department {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  intro?: string;
  about: string;
  /**
   * Rich multi-paragraph intro for the About section. When present it renders
   * instead of the single-string `about` (which is capped at one DB-backed
   * paragraph). Static-only - not fetched from the backend - so it is a
   * reliable home for long-form content the thin DB `about` field can't hold.
   */
  overview?: string[];
  /** "Why <Dept> at KSRMCE?" narrative paragraphs, shown in the About section. */
  whyDepartment?: string[];
  /** "Our Specialty - Future & Scope" narrative paragraphs. */
  specialty?: string[];
  /** Career paths graduates can pursue, rendered as a tag grid. */
  careerOpportunities?: string[];
  /** "Why Choose" feature bullets, rendered as a checklist. */
  whyChoose?: string[];
  /** Closing statement rendered as an emphasized callout at the end of About. */
  closingStatement?: string;
  aboutVideo?: string;
  vision: string;
  mission: string[];
  peos: PEO[];
  pos: PO[];
  psos: PSO[];
  aiHighlights: AIHighlight[];
  hod: HOD;
  faculty: FacultyMember[];
  programmes: Programme[];
  labs: Lab[];
  gallery?: string[];
  heroImage: string;
}
