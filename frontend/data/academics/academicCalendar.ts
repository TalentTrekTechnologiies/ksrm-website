export interface CalendarEntry {
  label: string
  regulation: string
  pdfLink: string
}

export interface CalendarYear {
  year: string
  entries: CalendarEntry[]
}

export interface AcademicCalendarData {
  pageTitle: string
  subtitle: string
  intro: string
  currentAY: string
  calendars: CalendarYear[]
  examPortalLink: string
  note: string
  contact: {
    section: string
    phone: string
    email: string
  }
}

export const academicCalendar: AcademicCalendarData = {
  pageTitle: "Academic Calendar",
  subtitle: "Stay on track with semester schedules, exam timetables and important academic dates",
  intro:
    "KSRM College of Engineering follows the academic calendar prescribed by JNTUA (Jawaharlal Nehru Technological University Anantapur). The calendar includes important dates for semester classes, examinations, and academic activities. Download regulation-wise academic calendars below.",
  currentAY: "2025–2026",
  calendars: [
    {
      year: "2025–2026",
      entries: [
        {
          label: "B.Tech I Semester (R23UG)",
          regulation: "R23UG",
          pdfLink: "#",
        },
        {
          label: "B.Tech III & IV Semester (R23UG)",
          regulation: "R23UG",
          pdfLink: "#",
        },
        {
          label: "B.Tech V & VI Semester (R23UG)",
          regulation: "R23UG",
          pdfLink: "#",
        },
        {
          label: "B.Tech VII & VIII Semester (R23UG)",
          regulation: "R23UG",
          pdfLink: "#",
        },
        {
          label: "MBA I Year (R25)",
          regulation: "R25",
          pdfLink: "#",
        },
        {
          label: "M.Tech I Semester (R22PG)",
          regulation: "R22PG",
          pdfLink: "#",
        },
      ],
    },
    {
      year: "2024–2025",
      entries: [
        {
          label: "B.Tech (R23UG / R20UG / R18UG)",
          regulation: "Multiple",
          pdfLink: "#",
        },
        {
          label: "M.Tech (R22PG / R18PG)",
          regulation: "Multiple",
          pdfLink: "#",
        },
        {
          label: "MBA (R19 / R25)",
          regulation: "Multiple",
          pdfLink: "#",
        },
      ],
    },
    {
      year: "2023–2024",
      entries: [
        {
          label: "B.Tech (R20UG / R18UG / R15UG)",
          regulation: "Multiple",
          pdfLink: "#",
        },
        {
          label: "M.Tech (R18PG)",
          regulation: "R18PG",
          pdfLink: "#",
        },
      ],
    },
  ],
  examPortalLink: "https://www.jemexam.com/ksrmresult/results_notifications.php",
  note: "Academic calendars are issued by the Examination Section. Dates are subject to revision by JNTUA. Please check college notices regularly for any amendments or changes to the schedule.",
  contact: {
    section: "Examination Section",
    phone: "+91 8143731980 / 08562 295972",
    email: "principal@ksrmce.ac.in",
  },
}
