export interface LibraryStats {
  totalBooks: string
  journals: string
  eResources: string
  seatingCapacity: string
}

export interface LibrarySection {
  name: string
  description: string
}

export interface EResource {
  name: string
  description: string
  accessLink: string
}

export interface LibraryData {
  pageTitle: string
  subtitle: string
  intro: string
  stats: LibraryStats
  sections: LibrarySection[]
  eResources: EResource[]
  rules: string[]
  contact: {
    librarian: string
    phone: string
    email: string
    timings: string
  }
}

export const library: LibraryData = {
  pageTitle: "Library",
  subtitle: "Knowledge Hub of the Campus",
  intro:
    "The Central Library of KSRM College of Engineering is a state-of-the-art facility designed to support academic excellence and research. With an extensive collection of books, journals, and digital resources, our library serves as the knowledge hub of the campus. Our dedicated staff is committed to providing excellent service and fostering a conducive learning environment.",
  stats: {
    totalBooks: "45,000+",
    journals: "150+",
    eResources: "25+",
    seatingCapacity: "500+",
  },
  sections: [
    {
      name: "Reference Section",
      description:
        "Houses encyclopedias, dictionaries, handbooks, standards, and reference materials for quick consultation. Non-circulating collection available for in-library use.",
    },
    {
      name: "Periodicals Section",
      description:
        "Comprehensive collection of national and international journals, magazines, and newspapers covering all disciplines. Both print and digital subscriptions available.",
    },
    {
      name: "Digital Resources",
      description:
        "Access to e-books, online journals, research databases, and digital archives. OPAC system for easy search and retrieval of library materials.",
    },
    {
      name: "Lending Section",
      description:
        "Circulating collection of books available for home borrowing. Self-checkout system and easy renewal options for member convenience.",
    },
  ],
  eResources: [
    {
      name: "NPTEL (National Programme on Technology Enhanced Learning)",
      description:
        "Free online courses and video lectures in engineering, science, and humanities from IIT and IISC faculty.",
      accessLink: "https://nptel.ac.in",
    },
    {
      name: "IEEE Xplore",
      description:
        "Access to IEEE transactions, conferences, and standards in electrical engineering and computer science.",
      accessLink: "#",
    },
    {
      name: "Springer Link",
      description:
        "Digital library with access to journals, e-books, and research articles across all disciplines.",
      accessLink: "#",
    },
    {
      name: "JSTOR",
      description:
        "Comprehensive archive of academic journals, books, and primary sources in humanities, social sciences, and sciences.",
      accessLink: "#",
    },
    {
      name: "ProQuest Dissertations & Theses",
      description:
        "Global collection of dissertations and theses from universities worldwide for research reference.",
      accessLink: "#",
    },
  ],
  rules: [
    "All students, faculty, and staff are eligible library members with a valid identity card.",
    "Library hours: Monday-Friday 8:00 AM - 8:00 PM, Saturday 9:00 AM - 5:00 PM, Closed on Sundays and public holidays.",
    "Maximum borrowing limit: 4 books per member for 14 days.",
    "Overdue fine: ₹5 per book per day (maximum ₹50 per book).",
    "Lost or damaged books must be replaced or full amount paid.",
    "Silence is mandatory in the library. Mobile phones must be on silent mode.",
    "Food and beverages are strictly prohibited inside the library.",
    "Reservation of books is allowed up to 7 days in advance.",
    "Photocopying and printing facilities available at nominal charges.",
    "Members must return all borrowed materials before graduation or termination of course.",
  ],
  contact: {
    librarian: "Librarian (Dr. [Name])",
    phone: "+91-8554-233333 (Ext: 250)",
    email: "library@ksrmce.ac.in",
    timings:
      "Monday-Friday: 8:00 AM - 8:00 PM | Saturday: 9:00 AM - 5:00 PM | Closed: Sundays & Public Holidays",
  },
}
