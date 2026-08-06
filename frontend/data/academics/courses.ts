export interface UGProgramme {
  branch: string
  code: string
  intake: number
  duration: string
}

export interface PGProgramme {
  specialization: string
  department: string
  intake: number
  duration: string
}

export interface CoursesData {
  title: string
  tagline: string
  banner: string
  intro: string
  eapcetCode: string
  ugProgrammes: UGProgramme[]
  pgProgrammes: PGProgramme[]
  mbaMasters: {
    name: string
    intake: number
    duration: string
    description: string
  }
  diplomaProgrammes: string[]
  totalUGIntake: number
  totalPGIntake: number
  totalMBAIntake: number
}

export const coursesData: CoursesData = {
  title: "Courses & Intake",
  tagline: "Wide Range of UG and PG Programmes",
  banner: "/banners/academic.webp",
  intro:
    "KSRMCE offers a wide range of UG and PG programmes approved by AICTE and affiliated to JNTUA. Our programmes are designed to develop technically proficient and ethically sound professionals.",
  eapcetCode: "K.S.R.M.",

  ugProgrammes: [
    {
      branch: "Civil Engineering",
      code: "CE",
      intake: 90,
      duration: "4 years",
    },
    {
      branch: "Electrical & Electronics Engineering",
      code: "EEE",
      intake: 60,
      duration: "4 years",
    },
    {
      branch: "Electronics & Communication Engineering",
      code: "ECE",
      intake: 180,
      duration: "4 years",
    },
    {
      branch: "Mechanical Engineering",
      code: "ME",
      intake: 60,
      duration: "4 years",
    },
    {
      branch: "Computer Science & Engineering",
      code: "CSE",
      intake: 240,
      duration: "4 years",
    },
    {
      branch: "CSE (Artificial Intelligence & Machine Learning)",
      code: "CSE(AIML)",
      intake: 60,
      duration: "4 years",
    },
    {
      branch: "CSE (Data Science)",
      code: "CSE(DS)",
      intake: 60,
      duration: "4 years",
    },
    {
      branch: "Artificial Intelligence & Machine Learning",
      code: "AIML",
      intake: 60,
      duration: "4 years",
    },
  ],

  pgProgrammes: [
    {
      specialization: "Geotechnical Engineering",
      department: "Civil Engineering",
      intake: 18,
      duration: "2 years",
    },
    {
      specialization: "Power Systems",
      department: "Electrical & Electronics Engineering",
      intake: 18,
      duration: "2 years",
    },
    {
      specialization: "Embedded Systems & VLSI",
      department: "Electronics & Communication Engineering",
      intake: 18,
      duration: "2 years",
    },
    {
      specialization: "Renewable Energy",
      department: "Mechanical Engineering",
      intake: 18,
      duration: "2 years",
    },
    {
      specialization: "Artificial Intelligence & Data Science",
      department: "Computer Science & Engineering",
      intake: 18,
      duration: "2 years",
    },
  ],

  mbaMasters: {
    name: "Master of Business Administration",
    intake: 120,
    duration: "2 years",
    description:
      "Develop business acumen and leadership skills for corporate management and entrepreneurship.",
  },

  diplomaProgrammes: [
    "Civil Engineering",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering",
    "Electronics and Communication Engineering",
    "Computer Science and Engineering",
    "Artificial Intelligence and Machine Learning",
  ],

  totalUGIntake: 750,
  totalPGIntake: 90,
  totalMBAIntake: 120,
}
