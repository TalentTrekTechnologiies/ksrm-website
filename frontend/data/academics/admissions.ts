export interface Quota {
  name: string
  seats: string
}

export interface AdmissionRoute {
  programme: string
  route: string
  authority: string
  quota: Quota[]
  eligibility: string
}

export interface ProcessStep {
  step: string
  title: string
  description: string
}

export interface ImportantLink {
  label: string
  url: string
}

export interface AdmissionsData {
  pageTitle: string
  subtitle: string
  intro: string
  eapcetCode: string
  admissionRoutes: AdmissionRoute[]
  admissionProcess: ProcessStep[]
  documentsRequired: string[]
  importantLinks: ImportantLink[]
  contact: {
    office: string
    phone: string
    email: string
  }
}

export const admissions: AdmissionsData = {
  pageTitle: "Admissions",
  subtitle: "Join the K.S.R.M. family — shaping engineers since 1980",
  intro:
    "K.S.R.M. College of Engineering welcomes applications for B.Tech, M.Tech and MBA programmes. Admissions are conducted through APSCHE (AP State Council of Higher Education) via EAPCET/ICET/PGECET counselling. All admissions follow the guidelines of the Government of Andhra Pradesh and JNTUA regulations.",
  eapcetCode: "K.S.R.M.",
  admissionRoutes: [
    {
      programme: "B.Tech",
      route: "EAPCET (Engineering Agriculture & Pharmacy Common Entrance Test)",
      authority: "APSCHE, Andhra Pradesh",
      quota: [
        { name: "Convenor Quota (Category A)", seats: "70% of intake" },
        { name: "Management Quota (Category B)", seats: "30% of intake" },
      ],
      eligibility:
        "10+2 / Intermediate with Mathematics, Physics, Chemistry. Minimum 45% aggregate (40% for reserved categories).",
    },
    {
      programme: "M.Tech",
      route: "PGECET / GATE",
      authority: "APSCHE / IITs & NITs",
      quota: [
        { name: "Convenor Quota", seats: "70%" },
        { name: "Management Quota", seats: "30%" },
      ],
      eligibility: "B.Tech / B.E in relevant branch with minimum 50% aggregate.",
    },
    {
      programme: "MBA",
      route: "ICET (Integrated Common Entrance Test)",
      authority: "APSCHE, Andhra Pradesh",
      quota: [
        { name: "Convenor Quota", seats: "70%" },
        { name: "Management Quota", seats: "30%" },
      ],
      eligibility: "Any Bachelor's degree with minimum 50% aggregate.",
    },
  ],
  admissionProcess: [
    {
      step: "1",
      title: "Appear for Entrance Exam",
      description: "Register and appear for EAPCET / ICET / PGECET as applicable to your programme of choice.",
    },
    {
      step: "2",
      title: "Web Counselling",
      description: "Participate in APSCHE web counselling and exercise options for K.S.R.M. (Code: K.S.R.M.) based on your rank and category.",
    },
    {
      step: "3",
      title: "Allotment Letter",
      description: "Receive allotment letter from APSCHE after counselling rounds with your assigned branch and quota.",
    },
    {
      step: "4",
      title: "Report to College",
      description: "Report to K.S.R.M. College with original documents and pay the tuition fee within the stipulated deadline.",
    },
    {
      step: "5",
      title: "Document Verification",
      description: "Submit original certificates for thorough verification at the college admissions office.",
    },
    {
      step: "6",
      title: "Admission Confirmed",
      description: "Collect your ID card, hostel allotment letter (if applicable), and join the orientation programme.",
    },
  ],
  documentsRequired: [
    "10th Class Marks Memo",
    "Intermediate / 12th Class Marks Memo",
    "EAPCET / ICET / PGECET Hall Ticket & Rank Card",
    "Allotment Letter from APSCHE",
    "Transfer Certificate (TC) from previous school/college",
    "Study Certificate (Classes 6–10)",
    "Caste Certificate (if applicable)",
    "Income Certificate (if applicable)",
    "Aadhaar Card / Any Government ID",
    "Passport size photographs (6 copies)",
  ],
  importantLinks: [
    {
      label: "APSCHE Official Website",
      url: "https://sche.ap.gov.in",
    },
    {
      label: "EAPCET Information",
      url: "https://cets.apsche.ap.gov.in",
    },
    {
      label: "Online Fee Payment (SBI Collect)",
      url: "https://www.onlinesbi.sbi/sbicollect/icollecthome.htm",
    },
  ],
  contact: {
    office: "Admissions Office, K.S.R.M. College of Engineering, Kadapa – 516003",
    phone: "+91 8143731960 / 08562 295972 / +91 9000073434",
    email: "ksrmcengg@yahoo.co.in / principal@ksrmce.ac.in",
  },
}
