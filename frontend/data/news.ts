export interface NewsItem {
  id: number
  title: string
  date: string
  category: string
  description: string
  link: string
  isNew: boolean
}

export interface NewsData {
  pageTitle: string
  subtitle: string
  news: NewsItem[]
  categories: string[]
}

export const news: NewsData = {
  pageTitle: "News & Events",
  subtitle: "Stay updated with the latest from K.S.R.M.",
  news: [
    {
      id: 1,
      title: "KGCET 2K26 Results Announced",
      date: "2026-05-15",
      category: "Examinations",
      description:
        "KGCET 2026 results have been announced. Students can check their results at the official portal.",
      link: "https://ksrmce.ac.in/KGCET2K26-Results.pdf",
      isNew: true,
    },
    {
      id: 2,
      title: "Graduation Day 2026 Applications Open",
      date: "2026-04-01",
      category: "Events",
      description:
        "Applications for Graduation Day 2026 are now open. Students who have completed their degree can apply.",
      link: "#",
      isNew: true,
    },
    {
      id: 3,
      title: "Freshers Orientation 2025-26",
      date: "2025-08-15",
      category: "Events",
      description:
        "Welcome to the new batch of 2025-26. Orientation program details have been announced.",
      link: "#",
      isNew: false,
    },
    {
      id: 4,
      title: "NBA Accreditation Renewed",
      date: "2025-06-01",
      category: "Accreditation",
      description:
        "K.S.R.M. College of Engineering has successfully renewed NBA accreditation for multiple programmes.",
      link: "#",
      isNew: false,
    },
    {
      id: 5,
      title: "NIRF Ranking 2025 Submitted",
      date: "2025-03-01",
      category: "Rankings",
      description: "K.S.R.M. College has submitted its NIRF ranking data for 2025.",
      link: "https://ksrmce.ac.in/nirf.php",
      isNew: false,
    },
    {
      id: 6,
      title: "Industry-Academia Meet 2024",
      date: "2024-12-10",
      category: "Events",
      description:
        "Annual Industry-Academia meet held with participation from 20+ companies.",
      link: "#",
      isNew: false,
    },
  ],
  categories: ["All", "Examinations", "Events", "Accreditation", "Rankings", "Placements"],
}
