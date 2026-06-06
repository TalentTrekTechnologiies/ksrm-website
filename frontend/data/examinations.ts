export interface ExaminationsData {
  pageTitle: string
  subtitle: string
  about: string
  examPortalLink: string
  sbiCollectLink: string
  challanFormLink: string
  quickLinks: Array<{ label: string; url: string; type: "primary" | "secondary" }>
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
    "The Examination Section at KSRM College of Engineering manages all aspects of academic examinations including scheduling, notifications, results and revaluations.",
  examPortalLink: "https://www.jemexam.com/ksrmresult/results_notifications.php",
  sbiCollectLink: "https://www.onlinesbi.sbi/sbicollect/icollecthome.htm",
  challanFormLink: "https://ksrmce.ac.in/SBI_CHALLAN_FORM.pdf",
  quickLinks: [
    {
      label: "View Exam Results",
      url: "https://www.jemexam.com/ksrmresult/results_notifications.php",
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
    location: "Administrative Block, KSRM College of Engineering",
  },
}
