export interface IQACData {
  pageTitle: string
  subtitle: string
  about: string
  vision: string
  objectives: string[]
  functions: Array<{ title: string; description: string }>
  committee: Array<{ name: string; role: string }>
  aqarLinks: Array<{ year: string; link: string }>
  contact: { coordinator: string; phone: string; email: string }
}

export const iqac: IQACData = {
  pageTitle: "IQAC",
  subtitle: "Internal Quality Assurance Cell — Committed to Excellence",
  about:
    "The Internal Quality Assurance Cell (IQAC) at K.S.R.M. College of Engineering was established as per UGC/NAAC guidelines to develop and ensure quality benchmarks for institutional processes and academic outcomes. IQAC strives for continuous improvement in education quality and institutional performance.",
  vision:
    "To be a catalyst for quality enhancement initiatives and nurture a culture of excellence across all academic and administrative functions.",
  objectives: [
    "Develop and apply quality benchmarks for institutional processes",
    "Facilitate the creation of learner-centric environment for quality education",
    "Arrange for feedback from students, parents and stakeholders",
    "Organize inter and intra institutional workshops and seminars",
    "Document the various activities leading to quality improvement",
    "Prepare the Annual Quality Assurance Report (AQAR)",
  ],
  functions: [
    {
      title: "Quality Benchmarks",
      description:
        "Setting and maintaining standards for academic and administrative processes",
    },
    {
      title: "Feedback System",
      description:
        "Collecting and acting on feedback from students, faculty, employers and alumni",
    },
    {
      title: "Faculty Development",
      description:
        "Organizing FDPs, workshops and seminars for continuous faculty improvement",
    },
    {
      title: "Academic Audit",
      description:
        "Regular internal academic audits to assess compliance with quality standards",
    },
    {
      title: "AQAR Preparation",
      description: "Annual Quality Assurance Report submission to NAAC",
    },
    {
      title: "Best Practices",
      description: "Identifying and documenting institutional best practices",
    },
  ],
  committee: [
    { name: "Principal", role: "Chairperson" },
    { name: "IQAC Coordinator", role: "Director" },
    { name: "Senior Faculty Members", role: "Members" },
    { name: "Administrative Staff Representative", role: "Member" },
    { name: "Industry Expert", role: "External Member" },
    { name: "Alumni Representative", role: "External Member" },
  ],
  aqarLinks: [
    { year: "2023-24", link: "#" },
    { year: "2022-23", link: "#" },
    { year: "2021-22", link: "#" },
    { year: "2020-21", link: "#" },
  ],
  contact: {
    coordinator: "IQAC Coordinator",
    phone: "+91 9000073434",
    email: "principal@ksrmce.ac.in",
  },
}
