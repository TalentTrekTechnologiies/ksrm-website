export interface SyllabusEntry {
  regulation: string
  branches: string[]
  pdfLink: string
}

export interface Programme {
  name: string
  entries: SyllabusEntry[]
}

export interface SyllabusData {
  pageTitle: string
  subtitle: string
  intro: string
  programmes: Programme[]
  note: string
}

export const syllabus: SyllabusData = {
  pageTitle: "Syllabus",
  subtitle: "Regulation-wise syllabus for all programmes",
  intro:
    "KSRM College of Engineering follows the academic syllabus prescribed by Jawaharlal Nehru Technological University Anantapur (JNTUA). Detailed regulation-wise syllabi are available for download below for all B.Tech, M.Tech and MBA programmes. The syllabi are designed to meet NBA accreditation standards and equip students with industry-relevant knowledge and skills.",
  programmes: [
    {
      name: "B.Tech",
      entries: [
        {
          regulation: "R23UG (Current)",
          branches: [
            "Computer Science & Engineering",
            "CSE (AI & ML)",
            "CSE (Data Science)",
            "CSE (AI & ML Specialisation)",
            "Electronics & Communication Engineering",
            "Electrical & Electronics Engineering",
            "Civil Engineering",
            "Mechanical Engineering",
          ],
          pdfLink: "#",
        },
        {
          regulation: "R20UG",
          branches: ["All B.Tech Branches"],
          pdfLink: "#",
        },
        {
          regulation: "R18UG",
          branches: ["All B.Tech Branches"],
          pdfLink: "#",
        },
        {
          regulation: "R15UG (Archive)",
          branches: ["All B.Tech Branches"],
          pdfLink: "#",
        },
      ],
    },
    {
      name: "M.Tech",
      entries: [
        {
          regulation: "R22PG (Current)",
          branches: ["All Specialisations"],
          pdfLink: "#",
        },
        {
          regulation: "R18PG",
          branches: ["All Specialisations"],
          pdfLink: "#",
        },
      ],
    },
    {
      name: "MBA",
      entries: [
        {
          regulation: "R25 (Current)",
          branches: ["Management Studies"],
          pdfLink: "#",
        },
        {
          regulation: "R19 (Archive)",
          branches: ["Management Studies"],
          pdfLink: "#",
        },
      ],
    },
  ],
  note: "For regulation-wise detailed syllabus PDFs, visit the Academics section or contact the respective department. Syllabi are issued by JNTUA and are subject to periodic updates. Please verify with the department for any recent amendments.",
}
