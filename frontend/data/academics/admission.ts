export interface CommitteeMember {
  name: string
  designation: string
  department: string
  phone: string
  role: string
}

export interface EligibilityInfo {
  title: string
  content: string
}

export interface AdmissionData {
  title: string
  tagline: string
  banner: string
  ugEligibility: string
  seatCategories: string
  reservationPolicy: string
  diplomaLateralEntry: string
  pgEligibility: string
  committee: CommitteeMember[]
  convener: CommitteeMember
}

export const admissionData: AdmissionData = {
  title: "Admissions",
  tagline: "Pathway to Excellence",
  banner: "/banners/academic.webp",

  ugEligibility:
    "A candidate should possess 10+2 qualification from the Board of Intermediate, Government of Andhra Pradesh with Mathematics, Physics and Chemistry, or any equivalent examination. Admission to the four-year B.Tech programme (except NRI quota) requires qualifying the AP EAPCET, a state-level entrance test conducted by the Government of Andhra Pradesh. Candidates are admitted strictly on merit.",

  seatCategories:
    "Of the sanctioned intake, 70% are Category-A seats (filled by the EAPCET Convener on merit) and 30% are Category-B seats (NRI & Non-NRI, filled by college management per APSCHE guidelines).",

  reservationPolicy:
    "Reservation under Category-A seats follows GO MS 74, Government of Andhra Pradesh: SC - 15%, ST - 6%, BC - 29%.",

  diplomaLateralEntry:
    "10% of seats (lateral entry) are admitted by the ECET Convener for diploma holders from Andhra Pradesh State or equivalent.",

  pgEligibility:
    "70% Category-A seats are filled via web counselling based on GATE/PGECET rank and reservation rules; 30% Category-B (management quota) per APSCHE guidelines.",

  convener: {
    name: "Sri T. Kishore Kumar",
    designation: "Dean & Convener, Admissions",
    department: "Electrical & Electronics Engineering",
    phone: "7013122231",
    role: "Chairman",
  },

  committee: [
    {
      name: "Sri K. Vijay Bhaskar Reddy",
      designation: "Coordinator",
      department: "Humanities & Sciences",
      phone: "9440352335",
      role: "Coordinator",
    },
    {
      name: "Sri V. Ramachandra Reddy",
      designation: "Member",
      department: "Humanities & Sciences",
      phone: "9440169375",
      role: "Member",
    },
    {
      name: "Smt B. Venkata Lakshmi",
      designation: "Member",
      department: "Humanities & Sciences",
      phone: "8309261633",
      role: "Member",
    },
    {
      name: "Dr. V. Giridhar",
      designation: "Member",
      department: "Civil Engineering",
      phone: "9849927981",
      role: "Member",
    },
    {
      name: "Sri Y. Dasthagir",
      designation: "Member",
      department: "Civil Engineering",
      phone: "8919936410",
      role: "Member",
    },
    {
      name: "Sri D. Viswanath",
      designation: "Member",
      department: "Civil Engineering",
      phone: "9885076736",
      role: "Member",
    },
    {
      name: "Sri K. Ramamohan Reddy",
      designation: "Member",
      department: "Electrical & Electronics Engineering",
      phone: "9494924614",
      role: "Member",
    },
    {
      name: "Sri J. Suresh Babu",
      designation: "Member",
      department: "Mechanical Engineering",
      phone: "9247181832",
      role: "Member",
    },
    {
      name: "Sri P. Sivaseshu",
      designation: "Member",
      department: "Mechanical Engineering",
      phone: "9398151350",
      role: "Member",
    },
    {
      name: "Sri D. Merwin Rajesh",
      designation: "Member",
      department: "Mechanical Engineering",
      phone: "8897920252",
      role: "Member",
    },
    {
      name: "Dr. S.L. Prathap Reddy",
      designation: "Member",
      department: "Electronics & Communication Engineering",
      phone: "9701113444",
      role: "Member",
    },
    {
      name: "Sri M. Prabhakar",
      designation: "Member",
      department: "Electronics & Communication Engineering",
      phone: "9493339222",
      role: "Member",
    },
    {
      name: "Smt T. Umamaheswari",
      designation: "Member",
      department: "Electronics & Communication Engineering",
      phone: "8978150170",
      role: "Member",
    },
    {
      name: "Dr. V. Venkata Ramana",
      designation: "Member",
      department: "Computer Science & Engineering",
      phone: "9849777831",
      role: "Member",
    },
    {
      name: "Sri Y. Prasada Reddy",
      designation: "Member",
      department: "Computer Science & Engineering",
      phone: "7780109976",
      role: "Member",
    },
    {
      name: "Smt B. Swetha",
      designation: "Member",
      department: "Computer Science & Engineering",
      phone: "9492561783",
      role: "Member",
    },
    {
      name: "Sri N. Venkata Siva Reddy",
      designation: "Member",
      department: "Computer Science & Engineering",
      phone: "9985841600",
      role: "Member",
    },
    {
      name: "Miss P.M. Shiny Sangeetha",
      designation: "Receptionist",
      department: "Admissions Office",
      phone: "7013216855",
      role: "Receptionist",
    },
  ],
}
