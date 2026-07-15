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
