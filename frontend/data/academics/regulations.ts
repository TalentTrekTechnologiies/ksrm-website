export interface RegulationSet {
  code: string
  year: string
  applicableTo: string
  description: string
  keyPoints: string[]
  pdfLink: string
}

export interface ExaminationRule {
  rule: string
  description: string
}

export interface RegulationsData {
  pageTitle: string
  subtitle: string
  intro: string
  regulationSets: RegulationSet[]
  examinationRules: {
    title: string
    rules: ExaminationRule[]
  }
  note: string
}

export const regulations: RegulationsData = {
  pageTitle: "Regulations",
  subtitle: "Academic Rules and Guidelines",
  intro:
    "K.S.R.M. College of Engineering follows comprehensive regulations for all academic programmes as prescribed by JNTUA (Jawaharlal Nehru Technological University Ananthapuramu). These regulations govern admission, curriculum, assessment, and graduation requirements. Students are expected to adhere to all regulations outlined in this section.",
  regulationSets: [
    {
      code: "R20",
      year: "2020",
      applicableTo: "Students admitted from 2020 onwards",
      description:
        "The latest regulations incorporating outcome-based education, credit system, and industry-aligned curriculum. R20 regulations emphasize skill development, research aptitude, and holistic learning.",
      keyPoints: [
        "Credit-based semester system with minimum 120 credits for B.Tech",
        "Outcome-Based Education (OBE) framework aligned with NBA standards",
        "Continuous internal assessment with 30% weightage",
        "End-semester examinations with 70% weightage",
        "CGPA-based promotion and graduation criteria",
        "Provision for electives and specializations from 2nd year",
        "Mandatory internship and project work",
        "Minimum 6.5 CGPA required for distinction",
      ],
      pdfLink: "/documents/regulations/R20-regulations.pdf",
    },
    {
      code: "R19",
      year: "2019",
      applicableTo: "Students admitted from 2019 to 2019",
      description:
        "Previous regulation framework with traditional semester system. Provides flexibility in course selection and assessment methodology.",
      keyPoints: [
        "Credit-based semester system with minimum 120 credits for B.Tech",
        "Continuous evaluation (assignments, quizzes, mid-semester) carrying 30% marks",
        "End-semester examinations carrying 70% marks",
        "CGPA-based progression and graduation",
        "Provision for lateral entry and bridge programmes",
        "Electives from third year onwards",
        "Minimum GPA 6.0 for distinction",
        "Flexibility in course completion up to 8 years",
      ],
      pdfLink: "/documents/regulations/R19-regulations.pdf",
    },
    {
      code: "R16",
      year: "2016",
      applicableTo: "Students admitted from 2016 to 2018",
      description:
        "Former regulation framework with traditional grading system. Still applicable to continuing students as per JNTUA guidelines.",
      keyPoints: [
        "Semester system with 120 credits for B.Tech programmes",
        "Continuous assessment and end-semester examinations",
        "Grade-point system for assessment",
        "Provision for supplementary examinations",
        "Minimum 50% attendance required",
        "Electives from 3rd year onwards",
        "Comprehensive project and viva voce requirements",
        "Maximum academic period: 8 years from admission",
      ],
      pdfLink: "/documents/regulations/R16-regulations.pdf",
    },
    {
      code: "R13",
      year: "2013",
      applicableTo: "Old regulation (archived reference)",
      description:
        "Earlier regulation framework maintained for reference and archival purposes. New admissions follow R20 or R19.",
      keyPoints: [
        "Semester system with coursework and evaluation",
        "Continuous internal assessment (30%) and end-semester (70%)",
        "Grade-based promotion system",
        "Electives available from 4th semester onwards",
        "Project work in final year",
        "Provision for improvement examinations",
        "Academic performance monitoring and counseling",
      ],
      pdfLink: "/documents/regulations/R13-regulations.pdf",
    },
  ],
  examinationRules: {
    title: "Examination and Assessment Rules",
    rules: [
      {
        rule: "Minimum Attendance",
        description:
          "Students must maintain a minimum of 75% attendance in theory courses and 80% in practical/laboratory courses to be eligible for examinations. Condonation of shortage of attendance may be granted by the Principal in genuine cases.",
      },
      {
        rule: "Internal Assessment",
        description:
          "Internal assessment comprises assignments, quizzes, mid-semester examinations, and participation, carrying 30% weightage of total marks. The distribution is as per department guidelines.",
      },
      {
        rule: "End-Semester Examination",
        description:
          "End-semester examination is conducted by JNTUA and carries 70% weightage. The duration is typically 3 hours for theory courses and 3-4 hours for practical examinations.",
      },
      {
        rule: "Pass Criteria",
        description:
          "A student must obtain a minimum of 35% marks in end-semester examination and 40% in overall (internal + external) to pass a course. For practical courses, 50% marks overall is required.",
      },
      {
        rule: "Supplementary Examinations",
        description:
          "Students who fail a course can appear for supplementary examinations in the next available opportunity (usually within 6 months). A maximum of 2 supplementary attempts is permitted.",
      },
      {
        rule: "Improvement Examinations",
        description:
          "Students may appear for improvement examinations to enhance their grades in passed courses. The better of the two scores will be considered for CGPA calculation.",
      },
      {
        rule: "Malpractice and Misconduct",
        description:
          "Use of unfair means, copying, impersonation, or any form of academic dishonesty will result in cancellation of examination for that semester and disciplinary action as per college norms.",
      },
      {
        rule: "Leave During Examinations",
        description:
          "Leave during examinations is not granted except on medical grounds with supporting documents. Students absent due to medical reasons should submit medical certificates within 7 days.",
      },
      {
        rule: "Grade Point Scale",
        description:
          "Marks are converted to CGPA on a scale of 0-10. Each course has specific credit points. CGPA is calculated as the weighted average of grade points across all courses.",
      },
      {
        rule: "Academic Probation",
        description:
          "Students with CGPA below 5.0 at the end of a semester are placed on academic probation and must improve performance in the next semester or risk dismissal from the programme.",
      },
    ],
  },
  note: "All regulations are subject to amendments as per directives from JNTUA and APSCHE (Andhra Pradesh State Council for Higher Education). Students are advised to refer to the official regulation documents and check with their respective departments for any clarifications or updates. The college reserves the right to modify regulations to ensure quality education and regulatory compliance.",
}
