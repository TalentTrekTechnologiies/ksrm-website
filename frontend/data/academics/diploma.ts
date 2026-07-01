// REAL data from official diploma pamphlet 2026

export interface DiplomaCourse {
  code: string
  name: string
  description: string
}

export interface DiplomaFeature {
  icon: string
  title: string
  description: string
}

export interface DiplomaData {
  heading: string
  tagline: string
  banner: string
  admissionsOpenYear: number
  courses: DiplomaCourse[]
  courseApprovalNote: string
  features: DiplomaFeature[]
  accreditations: string[]
  rankings: {
    name: string
    value: string
  }[]
  contactNumbers: string[]
  website: string
  socialHandle: string
  busRoutes: string[]
}

export const diplomaData: DiplomaData = {
  heading: "Join Polytechnic, Build Your Career",
  tagline: "Diploma Admissions Open 2026",
  banner: "/banners/diploma.jpg",
  admissionsOpenYear: 2026,

  courses: [
    {
      code: "CE",
      name: "Civil Engineering",
      description: "Infrastructure and construction technology",
    },
    {
      code: "EEE",
      name: "Electrical and Electronics Engineering",
      description: "Power systems and electrical technology",
    },
    {
      code: "ME",
      name: "Mechanical Engineering",
      description: "Manufacturing and mechanical systems",
    },
    {
      code: "ECE",
      name: "Electronics and Communication Engineering",
      description: "Electronics and communication systems",
    },
    {
      code: "CSE",
      name: "Computer Science and Engineering",
      description: "Software development and computing",
    },
    {
      code: "AIML",
      name: "Artificial Intelligence and Machine Learning",
      description: "AI and machine learning technologies",
    },
  ],

  courseApprovalNote: "* Subject to approval by Statutory Bodies",

  features: [
    {
      icon: "GraduationCap",
      title: "Industry-Oriented Training",
      description:
        "Industry-oriented training programs with placement assistance and real-world experience",
    },
    {
      icon: "Wifi",
      title: "24x7 Wi-Fi Connectivity",
      description:
        "24x7 Wi-Fi facility with 1 Gbps bandwidth connectivity throughout campus",
    },
    {
      icon: "Home",
      title: "Residential Facilities",
      description:
        "Separate hostels for Girls & Boys with Wi-Fi and hot water facilities",
    },
    {
      icon: "Bus",
      title: "Transportation",
      description:
        "Bus facility available from multiple locations including Kadapa, Rayachoti & surrounding areas",
    },
    {
      icon: "Briefcase",
      title: "Internship Opportunities",
      description:
        "Paid internship opportunities in industry, academic institutions, and research organizations",
    },
    {
      icon: "Snowflake",
      title: "Air-Conditioned Facility",
      description: "Fully air-conditioned residential facility on campus",
    },
  ],

  accreditations: [
    "Approved by AICTE New Delhi",
    "Affiliated to JNTUA Ananthapuramu",
    "ISO 9001:2015 | 14001:2015 | 50001:2018 Certified",
    "NBA Accredited",
    "NAAC A+ Accreditation",
    "Institution's Innovation Council (IIC)",
  ],

  rankings: [
    { name: "Careers360 Rating", value: "AAA+" },
    { name: "SII Gold Band", value: "Premium Institution" },
    { name: "STEM Rankings 2025", value: "31st Rank India" },
    { name: "The Week Rankings 2025", value: "AIR-144" },
  ],

  contactNumbers: [
    "8143731980",
    "9948101980",
    "9948201980",
    "9948301980",
  ],

  website: "www.ksrmce.ac.in",
  socialHandle: "@ksrmceofficial",

  busRoutes: [
    "Vempalli",
    "Yerraguntla",
    "Badvel",
    "Mydukur",
    "Proddutur",
    "Ontimitta",
    "Kadapa",
    "Rayachoti",
  ],
}
