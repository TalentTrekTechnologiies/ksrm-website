export interface IntakeEntry {
  branch: string
  code: string
  intake: number
  accreditation: string
}

export interface Programme {
  level: string
  regulation: string
  intake: IntakeEntry[]
}

export interface CoursesIntakeData {
  pageTitle: string
  subtitle: string
  intro: string
  eapcetCode: string
  programmes: Programme[]
  approvals: string[]
  contactAdmissions: {
    office: string
    phone: string
    email: string
  }
}

export const coursesIntake: CoursesIntakeData = {
  pageTitle: "Courses Offered & Intake",
  subtitle: "AICTE approved programmes with strong industry alignment",
  intro:
    "K.S.R.M. College of Engineering offers AICTE approved undergraduate, postgraduate and management programmes affiliated to Jawaharlal Nehru Technological University Anantapur (JNTUA). The college holds UGC Autonomous status and is recognized for excellence in engineering education.",
  eapcetCode: "K.S.R.M.",
  programmes: [
    {
      level: "B.Tech (4 Years)",
      regulation: "R23UG",
      intake: [
        {
          branch: "Civil Engineering",
          code: "CE",
          intake: 60,
          accreditation: "NBA",
        },
        {
          branch: "Computer Science & Engineering",
          code: "CSE",
          intake: 120,
          accreditation: "NBA",
        },
        {
          branch: "CSE (Artificial Intelligence & Machine Learning)",
          code: "CSE-AIML",
          intake: 60,
          accreditation: "",
        },
        {
          branch: "CSE (Data Science)",
          code: "CSE-DS",
          intake: 60,
          accreditation: "",
        },
        {
          branch: "CSE (AI & ML Specialisation)",
          code: "CSE-AIML-S",
          intake: 60,
          accreditation: "",
        },
        {
          branch: "Electrical & Electronics Engineering",
          code: "EEE",
          intake: 60,
          accreditation: "NBA",
        },
        {
          branch: "Electronics & Communication Engineering",
          code: "ECE",
          intake: 120,
          accreditation: "NBA",
        },
        {
          branch: "Mechanical Engineering",
          code: "ME",
          intake: 60,
          accreditation: "NBA",
        },
      ],
    },
    {
      level: "M.Tech (2 Years)",
      regulation: "R22PG",
      intake: [
        {
          branch: "Computer Science & Engineering",
          code: "M.Tech-CSE",
          intake: 18,
          accreditation: "",
        },
        {
          branch: "VLSI & Embedded Systems",
          code: "M.Tech-VLSI",
          intake: 18,
          accreditation: "",
        },
        {
          branch: "Structural Engineering",
          code: "M.Tech-SE",
          intake: 18,
          accreditation: "",
        },
      ],
    },
    {
      level: "MBA (2 Years)",
      regulation: "R25",
      intake: [
        {
          branch: "Master of Business Administration",
          code: "MBA",
          intake: 60,
          accreditation: "",
        },
      ],
    },
  ],
  approvals: [
    "AICTE Approved",
    "Affiliated to JNTUA",
    "UGC Autonomous",
    "NAAC Accredited",
    "NBA Accredited (select programmes)",
  ],
  contactAdmissions: {
    office: "Admissions Office",
    phone: "+91 8143731960 / 08562 295972",
    email: "principal@ksrmce.ac.in",
  },
}
