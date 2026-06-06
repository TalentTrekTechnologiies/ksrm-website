export interface Club {
  name: string
  description: string
  icon: string
  coordinator: {
    name: string
    phone: string
  }
}

export interface Achievement {
  year: string
  event: string
  level: string
  result: string
}

export interface AnnualFest {
  name: string
  description: string
  month: string
  highlights: string[]
}

export interface CulturalData {
  pageTitle: string
  subtitle: string
  intro: string
  annualFest: AnnualFest
  clubs: Club[]
  achievements: Achievement[]
  culturalSecretary: {
    name: string
    phone: string
    email: string
  }
}

export const cultural: CulturalData = {
  pageTitle: "Cultural Club",
  subtitle: "Celebrating creativity, talent and the spirit of togetherness",
  intro:
    "The Cultural Club at KSRM College of Engineering organises a vibrant range of cultural activities, events and festivals that bring out the artistic talents of students and foster a sense of unity and college pride.",
  annualFest: {
    name: "KALAKRITI",
    description:
      "KALAKRITI is the annual cultural festival of KSRM College of Engineering, celebrating music, dance, drama, fine arts and literary events. Students from across the Rayalaseema region participate in this flagship event.",
    month: "February",
    highlights: [
      "Music & Dance Competitions",
      "Drama & Street Play",
      "Fine Arts Exhibition",
      "Literary Events",
      "Fashion Show",
      "Battle of Bands",
    ],
  },
  clubs: [
    {
      name: "Music Club",
      description: "Classical and contemporary music — vocal and instrumental",
      icon: "Music",
      coordinator: {
        name: "Faculty Coordinator",
        phone: "+91 9000073434",
      },
    },
    {
      name: "Dance Club",
      description: "Classical, folk and Western dance forms",
      icon: "Users",
      coordinator: {
        name: "Faculty Coordinator",
        phone: "+91 9000073434",
      },
    },
    {
      name: "Drama Club",
      description: "Stage plays, street plays and one-act plays in Telugu and English",
      icon: "Mic",
      coordinator: {
        name: "Faculty Coordinator",
        phone: "+91 9000073434",
      },
    },
    {
      name: "Fine Arts Club",
      description: "Painting, sketching, pottery and rangoli",
      icon: "Palette",
      coordinator: {
        name: "Faculty Coordinator",
        phone: "+91 9000073434",
      },
    },
    {
      name: "Literary Club",
      description: "Debates, elocution, creative writing and quizzes",
      icon: "BookOpen",
      coordinator: {
        name: "Faculty Coordinator",
        phone: "+91 9000073434",
      },
    },
  ],
  achievements: [
    {
      year: "2024",
      event: "Inter-College Cultural Meet",
      level: "University",
      result: "Overall Champions",
    },
    {
      year: "2023",
      event: "Yuva Tarangalu State Cultural Festival",
      level: "State",
      result: "Best Cultural Team Award",
    },
  ],
  culturalSecretary: {
    name: "Cultural Secretary",
    phone: "+91 9000073434",
    email: "principal@ksrmce.ac.in",
  },
}
