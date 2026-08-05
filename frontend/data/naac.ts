export interface NAACData {
  pageTitle: string
  subtitle: string
  about: string
  accreditationStatus: {
    grade: string
    cgpa: string
    cycle: string
    validUntil: string
  }
  ssrLink: string
  dvvLink: string
  criteria: Array<{ number: string; title: string; description: string }>
  documents: Array<{ name: string; link: string }>
}

export const naac: NAACData = {
  pageTitle: "NAAC",
  subtitle: "National Assessment and Accreditation Council",
  about:
    "K.S.R.M. College of Engineering has been accredited by the National Assessment and Accreditation Council (NAAC). NAAC accreditation is a mark of quality assurance recognizing the institution's commitment to providing quality higher education.",
  accreditationStatus: {
    grade: "A+",
    cgpa: "2.88",
    cycle: "3rd Cycle",
    validUntil: "2026",
  },
  ssrLink: "https://ksrmce.ac.in/NAAC.php",
  dvvLink: "https://ksrmce.ac.in/DVV2.php",
  criteria: [
    {
      number: "1",
      title: "Curricular Aspects",
      description:
        "Curriculum design, academic flexibility and enrichment programmes",
    },
    {
      number: "2",
      title: "Teaching-Learning & Evaluation",
      description:
        "Student enrollment, teaching methods and evaluation reforms",
    },
    {
      number: "3",
      title: "Research, Innovations & Extension",
      description:
        "Research output, patents, consultancy and extension activities",
    },
    {
      number: "4",
      title: "Infrastructure & Learning Resources",
      description: "Physical facilities, library, IT infrastructure",
    },
    {
      number: "5",
      title: "Student Support & Progression",
      description:
        "Student services, scholarships, career guidance and alumni",
    },
    {
      number: "6",
      title: "Governance, Leadership & Management",
      description: "Institutional governance, finance and administration",
    },
    {
      number: "7",
      title: "Institutional Values & Best Practices",
      description:
        "Gender equity, environmental consciousness and best practices",
    },
  ],
  documents: [
    { name: "Self Study Report (SSR)", link: "https://ksrmce.ac.in/NAAC.php" },
    {
      name: "DVV Clarifications",
      link: "https://ksrmce.ac.in/DVV2.php",
    },
    { name: "AQAR 2023-24", link: "#" },
    {
      name: "Institution Core Values",
      link: "https://ksrmce.ac.in/NAAC/Institution Core Values.pdf",
    },
    {
      name: "Code of Professional Conduct",
      link: "https://ksrmce.ac.in/NAAC/Code of Professional Conduct.pdf",
    },
  ],
}
