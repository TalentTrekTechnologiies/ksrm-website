// HOME PAGE DATA — centralized content

export const heroData = {
  badge: "NAAC A++ · NBA Tier-1 · UGC Autonomous",
  heading: "Ignite Your Potential,\nEngineer Your Future",
  subtext: "KSRM College of Engineering, Kadapa — 45 years of engineering excellence.",
  captions: [
    { label: "RESEARCH & INNOVATION", text: "State-of-the-art Laboratories" },
    { label: "CAMPUS LIFE", text: "Vibrant Cultural Activities" },
    { label: "EXCELLENCE", text: "Sports & Achievements" },
    { label: "ENVIRONMENT", text: "Beautiful Green Campus" },
    { label: "LEARNING", text: "Modern Digital Library" },
  ],
  buttons: [
    { text: "Apply Now", href: "/admissions", variant: "primary" },
    { text: "Explore Campus", href: "/about", variant: "secondary" },
  ],
  news: [
    { isNew: true, date: "May 28", text: "Sem-End Exams May-June 2026 Preponed" },
    { isNew: true, date: "May 20", text: "M.Tech II Sem Supplementary Results Out" },
    { isNew: false, date: "May 15", text: "Graduation Day 2K26 Forms Open" },
    { isNew: false, date: "May 10", text: "KGCET-2K26 Results Announced" },
  ],
  backgroundVideo: "/videos/main-block.mp4",
}

export const statsData = [
  { value: 46, suffix: "+", label: "Years of Excellence" },
  { value: 25, suffix: "", label: "Acres Campus Area" },
  { value: 1200, suffix: "+", label: "Students Intake" },
  { value: 150, suffix: "+", label: "Faculty Members" },
  { value: 7, suffix: "", label: "Departments" },
  { value: 90, suffix: "%", label: "Placement Rate" },
  { value: 15000, suffix: "+", label: "Alumni Network" },
  { value: 200, suffix: "+", label: "Companies Recruiting" },
]

export const visionMissionData = {
  vision: "To evolve as center of repute for providing quality academic programs amalgamated with creative learning and research excellence to produce graduates with leadership qualities, ethical and human values to serve the nation.",
  missions: [
    {
      code: "M1",
      text: "To provide high quality education with enriched curriculum blended with impactful teaching-learning practices.",
    },
    {
      code: "M2",
      text: "To promote research, entrepreneurship and innovation through industry collaborations.",
    },
    {
      code: "M3",
      text: "To produce highly competent professional leaders for contributing to Socio-economic development of region and the nation.",
    },
  ],
}

export const aboutData = {
  heading: "Four Decades of Engineering Excellence",
  paragraphs: [
    "Established in 1980 in memory of Late Sri Srinivasa Reddy, KSRM College of Engineering was born from the vision of Late Sri Kandula Obul Reddy to bring quality technical education to the Rayalaseema region of Andhra Pradesh.",
    "Today, as a UGC Autonomous institution affiliated to JNTUA, we continue that legacy — shaping engineers, innovators, and leaders who carry our values into the world.",
  ],
  stats: [
    { num: "1980", label: "Established" },
    { num: "7+", label: "Departments" },
    { num: "UGC", label: "Autonomous" },
  ],
  image: "/topview (1).jpg",
  imageCaption: "Smt. K. Rajeswari Garu",
  badgeText: "YEARS OF TRUST",
  ctaText: "Read Our Story →",
  ctaLink: "/about",
}

export const servicesData = [
  { icon: "/posters/admissions.svg", title: "Admissions", desc: "Apply & eligibility", link: "/admissions" },
  { icon: "/posters/examinations.svg", title: "Examinations", desc: "Results & timetables", link: "/results" },
  { icon: "/posters/placements.svg", title: "Placements", desc: "Careers & recruiters", link: "/placements" },
  { icon: "/posters/library.svg", title: "Library", desc: "E-resources & OPAC", link: "/library" },
  { icon: "/posters/syllabus.svg", title: "Syllabus", desc: "Download by semester", link: "/academics" },
  { icon: "/posters/student-portal.svg", title: "Student Portal", desc: "Login portal", link: "/contact" },
  { icon: "/posters/alumni.svg", title: "Alumni", desc: "Network & events", link: "/alumni" },
  { icon: "/posters/research.svg", title: "Research", desc: "Publications & R&D", link: "/research" },
]

export const departmentsData = [
  { code: "CSE", name: "Computer Science & Engineering", hod: "Dr. V. Lokeswara Reddy", link: "/departments/cse", icon: "/posters/departments/cse.svg" },
  { code: "ECE", name: "Electronics & Communication", hod: "Dr. M. Venkatanarayana", link: "/departments/ece", icon: "/posters/departments/ece.svg" },
  { code: "EEE", name: "Electrical & Electronics", hod: "Dr. M.S. Priyadarshini", link: "/departments/eee", icon: "/posters/departments/eee.svg" },
  { code: "MECH", name: "Mechanical Engineering", hod: "Dr. D. Ravikanth", link: "/departments/mech", icon: "/posters/departments/mech.svg" },
  { code: "CIVIL", name: "Civil Engineering", hod: "Dr. G. Chennakesava Reddy", link: "/departments/civil", icon: "/posters/departments/civil.svg" },
  { code: "H&S", name: "Humanities & Sciences", hod: "Dr. V. Ramachandra Reddy", link: "/departments/hs", icon: "/posters/departments/hs.svg" },
  { code: "MBA", name: "Management Studies", hod: "Department of MBA", link: "/departments/mba", icon: "/posters/departments/mba.svg" },
]

export const newsData = [
  {
    category: "Examinations",
    date: "May 15, 2026",
    title: "KGCET 2K26 Results Announced",
    link: "/news",
    gradient: "linear-gradient(135deg, #2B3490, #1e2570)",
  },
  {
    category: "Events",
    date: "April 1, 2026",
    title: "Graduation Day 2026 Applications Open",
    link: "/news",
    gradient: "linear-gradient(135deg, #1a6ea8, #134e7a)",
  },
  {
    category: "Events",
    date: "August 15, 2025",
    title: "Freshers Orientation 2025-26",
    link: "/news",
    gradient: "linear-gradient(135deg, #9c2752, #6e1839)",
  },
]

export const admissionsData = {
  heading: "Begin Your Engineering Journey",
  subheading: "EAPCET Code: KSRM | Kadapa, Andhra Pradesh",
  btech: {
    image: "/b-tech-banner.png",
    branches: ["CSE", "ECE", "EEE", "CIVIL", "MECH", "AI&ML", "DS", "AIML"],
    highlight: "750+ Seats | 8 Branches | 4 Years",
    buttonText: "View Brochure",
  },
  diploma: {
    image: "/diploma-banner.png",
    branches: ["Civil", "Mechanical", "ECE", "EEE", "CSE"],
    highlight: "Lateral Entry Available | 3 Years | EAPCET Eligible",
    buttonText: "Download Brochure",
    link: "/Diploma-Brochure-KSRMCE (1).pdf",
  },
  helpline: {
    title: "Need Help?",
    phone1: "+91-9000073434",
    phone2: "+91-8143731980",
    email: "ksrmcengg@yahoo.co.in",
  },
}

export const placementsData = {
  heading: "Placements",
  subheading: "Join 1200+ graduates placed at India's top companies",
  stats: [
    { value: "1200+", label: "Students Placed" },
    { value: "200+", label: "Recruiting Companies" },
    { value: "12", label: "LPA Highest Package", unit: "₹" },
    { value: "90%", label: "Placement Rate" },
  ],
  posters: Array.from({ length: 12 }, (_, i) => `/placement records/${String(i + 1).padStart(2, "0")}.webp`),
  ctaText: "View Full Placements",
  ctaLink: "/placements",
}

export const recruitersData = {
  heading: "Recruited by 200+ Top Companies",
  badgeText: "90% Placement Rate",
  recruiters: [
    { name: "TCS", logo: "/recruiters/tcs.jpg" },
    { name: "Infosys", logo: "/recruiters/infosys.jpg" },
    { name: "Wipro", logo: "/recruiters/wipro.jpg" },
    { name: "Cognizant", logo: "/recruiters/cognizant.jpg" },
    { name: "Capgemini", logo: "/recruiters/capegemini.jpg" },
    { name: "HCL", logo: "/recruiters/hcl.jpg" },
    { name: "Mindtree", logo: "/recruiters/mindtree.jpg" },
    { name: "Mphasis", logo: "/recruiters/mphasis.jpg" },
    { name: "NTT Data", logo: "/recruiters/ntt data.jpg" },
    { name: "Hexaware", logo: "/recruiters/hexaware.jpg" },
    { name: "Birla Soft", logo: "/recruiters/birla soft.jpg" },
    { name: "Virtusa", logo: "/recruiters/virtusa.jpg" },
    { name: "Atos", logo: "/recruiters/Atos.jpg" },
    { name: "Zoho", logo: "/recruiters/zoho.jpg" },
    { name: "GND Solutions", logo: "/recruiters/gnd solutions.jpg" },
    { name: "Goldman Sachs", logo: "/recruiters/goldsachs.jpg" },
    { name: "Renault", logo: "/recruiters/renault.jpg" },
  ],
}

export const testimonialsData = [
  {
    name: "Rahul Sharma",
    degree: "B.Tech CSE 2023",
    company: "TCS",
    quote: "KSRMCE gave me not just a degree but the skills and confidence to excel in the software industry.",
    avatar: "RS",
    rating: 5,
  },
  {
    name: "Priya Reddy",
    degree: "B.Tech ECE 2022",
    company: "Infosys",
    quote: "The labs and infrastructure at KSRMCE are top-notch. I learned hands-on skills that directly helped me in my career.",
    avatar: "PR",
    rating: 5,
  },
  {
    name: "Venkat Krishna",
    degree: "B.Tech MECH 2023",
    company: "L&T",
    quote: "From day one, the college focused on our overall development. The placement cell worked tirelessly for us.",
    avatar: "VK",
    rating: 5,
  },
]

export const campusVideosData = [
  {
    title: "Campus Tour",
    url: "https://www.youtube.com/embed/opMcRto95Pg",
  },
  {
    title: "Official Ad",
    url: "https://www.youtube.com/embed/faqh__a-PKI",
  },
  {
    title: "College Tour",
    url: "https://www.youtube.com/embed/Si_PEgnmoG8",
  },
]

export const accreditationsData = [
  {
    label: "NAAC",
    grade: "A++",
    title: "NAAC Accredited",
    subtitle: "3.60 CGPA",
    link: "/accreditation",
    linkText: "View Certificate",
    color: "#c8960c",
    logo: "/naac.png",
  },
  {
    label: "NBA",
    grade: "Tier-1",
    title: "NBA Accredited",
    subtitle: "CE, ECE, CSE, EEE, ME",
    link: "/accreditation",
    linkText: "View Programs",
    color: "#1a8fb8",
    logo: "/nba.png",
  },
  {
    label: "NIRF",
    grade: "Ranked",
    title: "NIRF India",
    subtitle: "Engineering Category",
    link: "/accreditation",
    linkText: "View Ranking",
    color: "#2B3490",
    logo: "/nirf.jpg",
  },
  {
    label: "UGC",
    grade: "Autonomous",
    title: "UGC Status",
    subtitle: "Affiliated to JNTUA",
    link: "/accreditation",
    linkText: "Learn More",
    color: "#0d7a4d",
    logo: "/ugc.webp",
  },
]
