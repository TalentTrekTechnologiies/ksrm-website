export interface PlacementData {
  pageTitle: string
  subtitle: string
  about: string
  stats: {
    studentsPlaced: string
    companiesVisited: string
    highestPackage: string
    averagePackage: string
  }
  topRecruiters: Array<{ name: string; logo: string }>
  placementRecord: Array<{
    year: string
    studentsPlaced: number
    companiesVisited: number
    highestPackage: string
    averagePackage: string
  }>
  trainingPrograms: Array<{ name: string; description: string }>
  registrationLink: string
  contact: { officer: string; phone: string; email: string }
}

export const placements: PlacementData = {
  pageTitle: "Training & Placements",
  subtitle: "Bridging the gap between academia and industry",
  about:
    "The Training and Placement Cell (TAP Cell) at K.S.R.M. College of Engineering is dedicated to preparing students for successful careers through skill development, training programs, and industry connections. The cell maintains strong ties with leading companies across India.",
  stats: {
    studentsPlaced: "500+",
    companiesVisited: "80+",
    highestPackage: "18 LPA",
    averagePackage: "4.5 LPA",
  },
  topRecruiters: [
    { name: "TCS", logo: "/images/recruiters/tcs.png" },
    { name: "Infosys", logo: "/images/recruiters/infosys.png" },
    { name: "Wipro", logo: "/images/recruiters/wipro.png" },
    { name: "Cognizant", logo: "/images/recruiters/cognizant.png" },
    { name: "HCL Technologies", logo: "/images/recruiters/hcl.png" },
    { name: "Tech Mahindra", logo: "/images/recruiters/techmahindra.png" },
    { name: "Capgemini", logo: "/images/recruiters/capgemini.png" },
    { name: "Accenture", logo: "/images/recruiters/accenture.png" },
    { name: "Amazon", logo: "/images/recruiters/amazon.png" },
    { name: "Deloitte", logo: "/images/recruiters/deloitte.png" },
    { name: "IBM", logo: "/images/recruiters/ibm.png" },
    { name: "L&T", logo: "/images/recruiters/lnt.png" },
  ],
  placementRecord: [
    {
      year: "2023-24",
      studentsPlaced: 312,
      companiesVisited: 78,
      highestPackage: "18 LPA",
      averagePackage: "4.8 LPA",
    },
    {
      year: "2022-23",
      studentsPlaced: 289,
      companiesVisited: 65,
      highestPackage: "14 LPA",
      averagePackage: "4.2 LPA",
    },
    {
      year: "2021-22",
      studentsPlaced: 256,
      companiesVisited: 58,
      highestPackage: "12 LPA",
      averagePackage: "3.8 LPA",
    },
    {
      year: "2020-21",
      studentsPlaced: 198,
      companiesVisited: 45,
      highestPackage: "10 LPA",
      averagePackage: "3.5 LPA",
    },
  ],
  trainingPrograms: [
    {
      name: "Aptitude Training",
      description:
        "Quantitative, verbal and logical reasoning training for campus recruitment",
    },
    {
      name: "Technical Skills",
      description:
        "Programming, data structures, DBMS and domain-specific technical training",
    },
    {
      name: "Soft Skills",
      description:
        "Communication, group discussion, interview etiquette and personality development",
    },
    {
      name: "Mock Interviews",
      description: "Regular mock interview sessions with industry professionals",
    },
    {
      name: "Certification Courses",
      description:
        "Industry-recognized certifications through online platforms like NPTEL, Coursera",
    },
    {
      name: "Industry Visits",
      description:
        "Visits to leading companies for real-world exposure and networking",
    },
  ],
  registrationLink: "https://ksrmce.ac.in/tapregistration.php",
  contact: {
    officer: "Training & Placement Officer",
    phone: "+91 9000073434",
    email: "principal@ksrmce.ac.in",
  },
}
