export interface ExaminationsData {
  pageTitle: string
  subtitle: string
  about: string
  examPortalLink: string
  sbiCollectLink: string
  challanFormLink: string
  quickLinks: Array<{ label: string; url: string; type: "primary" | "secondary" }>
  portalLinks: Array<{ label: string; url: string }>
  academicCalendars: Record<string, Array<{ title: string; date: string; link?: string }>>
  availableYears: string[]
  recentNotifications: Array<{ title: string; date: string; link: string }>
  recentTimetables: Array<{ title: string; date: string; link: string }>
  contact: {
    section: string
    phone: string
    email: string
    location: string
  }
}

export const examinations: ExaminationsData = {
  pageTitle: "Examinations",
  subtitle: "Examination schedules, notifications and results",
  about:
    "The Examination Section at K.S.R.M. College of Engineering manages all aspects of academic examinations including scheduling, notifications, results and revaluations.",
  examPortalLink: "https://ksrmce.ac.in/examportal.php",
  sbiCollectLink: "https://www.onlinesbi.sbi/sbicollect/icollecthome.htm",
  challanFormLink: "https://ksrmce.ac.in/SBI_CHALLAN_FORM.pdf",
  quickLinks: [
    {
      label: "View Exam Results",
      url: "https://ksrmce.ac.in/examportal.php",
      type: "primary",
    },
    {
      label: "Pay Exam Fee (SBI Collect)",
      url: "https://www.onlinesbi.sbi/sbicollect/icollecthome.htm",
      type: "secondary",
    },
    {
      label: "Download Challan Form",
      url: "https://ksrmce.ac.in/SBI_CHALLAN_FORM.pdf",
      type: "secondary",
    },
  ],
  portalLinks: [
    { label: "Academic Calendars", url: "https://ksrmce.ac.in/examportal.php#academic-calendars" },
    { label: "Staff", url: "https://ksrmce.ac.in/examportal.php#staff" },
    { label: "Notifications", url: "https://ksrmce.ac.in/examportal.php#notifications" },
    { label: "Exam Time Tables", url: "https://ksrmce.ac.in/examportal.php#timetables" },
    { label: "Exam Results", url: "https://ksrmce.ac.in/examportal.php#results" },
    { label: "Supply Exam Results", url: "https://ksrmce.ac.in/examportal.php#supply-results" },
    { label: "SBI Challan Form", url: "https://ksrmce.ac.in/SBI_CHALLAN_FORM.pdf" },
    { label: "Examination Applications", url: "https://ksrmce.ac.in/examportal.php#applications" },
    { label: "Consolidated Internal Marks", url: "https://ksrmce.ac.in/examportal.php#marks" },
    { label: "Previous Question Papers", url: "https://ksrmce.ac.in/examportal.php#question-papers" },
    { label: "Model Papers", url: "https://ksrmce.ac.in/examportal.php#model-papers" },
    { label: "MID TERM Previous Papers", url: "https://ksrmce.ac.in/examportal.php#midterm-papers" },
    { label: "Toppers List", url: "https://ksrmce.ac.in/examportal.php#toppers" },
    { label: "Contact Us", url: "https://ksrmce.ac.in/examportal.php#contact" },
  ],
  availableYears: ["2025", "2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"],
  academicCalendars: {
    "2025": [
      { title: "Academic Calendars for MTech I Semester: AY 2025-2026", date: "27-10-2025" },
      { title: "Academic Calendars for MBA I Year: AY 2025-2026", date: "30-08-2025" },
      { title: "Academic Calendars for B.Tech I Semester for AY 2025-2026", date: "30-08-2025" },
      { title: "Academic Calendars for B.Tech VII & VIII Semester for AY 2025-2026", date: "17-07-2025" },
      { title: "Academic Calendars for B.Tech V & VI Semester for AY 2025-2026", date: "17-07-2025" },
      { title: "Academic Calendars for B.Tech III & IV Semester for AY 2025-2026", date: "17-07-2025" },
      { title: "Academic Calendars for B.Tech Honour and Minor Degree for AY 2025-2026", date: "17-07-2025" },
    ],
    "2024": [],
    "2023": [],
    "2022": [],
    "2021": [],
    "2020": [],
    "2019": [],
    "2018": [],
    "2017": [],
    "2016": [],
    "2015": [],
  },
  recentNotifications: [
    {
      title:
        "Circular - Preponement of Sem-End Exams May-June 2026",
      date: "2026-04-10",
      link: "#",
    },
    {
      title:
        "Notification: MBA II Semesters (R25) Regular Examinations, May-June 2026",
      date: "2026-04-10",
      link: "#",
    },
    {
      title:
        "Notification: B.Tech II Semesters (R23UG) Supple & Regular Examinations, May-June 2026",
      date: "2026-04-10",
      link: "#",
    },
    {
      title:
        "Notification: B.Tech I, III, V Semesters (R23UG) Supply Examinations, May-June 2026",
      date: "2026-04-10",
      link: "#",
    },
    {
      title:
        "Notification: B.Tech Even and Odd Semesters (R20UG) Supply Examinations, May 2026",
      date: "2026-04-08",
      link: "#",
    },
  ],
  recentTimetables: [
    {
      title:
        "B.Tech VI Sem (R23UG) End Regular and Supple Examinations, April-May 2026",
      date: "2026-04-10",
      link: "#",
    },
    {
      title:
        "B.Tech IV Sem (R23UG) End Regular and Supple Examinations, April-May 2026",
      date: "2026-04-10",
      link: "#",
    },
    {
      title:
        "MBA II Sem (R25) Regular End Examination, May 2026",
      date: "2026-04-10",
      link: "#",
    },
  ],
  contact: {
    section: "Examination Section",
    phone: "08562 295972",
    email: "principal@ksrmce.ac.in",
    location: "Administrative Block, K.S.R.M. College of Engineering",
  },
}
