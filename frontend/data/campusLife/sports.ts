export interface SportsFacility {
  name: string
  type: "indoor" | "outdoor"
  description: string
  capacity: string
}

export interface Achievement {
  year: string
  event: string
  level: "state" | "national" | "university"
  result: string
  players?: string[]
}

export interface UpcomingEvent {
  name: string
  date: string
  venue: string
}

export interface SportsData {
  pageTitle: string
  subtitle: string
  intro: string
  facilities: SportsFacility[]
  achievements: Achievement[]
  upcomingEvents: UpcomingEvent[]
  coordinator: {
    name: string
    phone: string
    email: string
  }
}

export const sports: SportsData = {
  pageTitle: "Sports",
  subtitle: "Excellence Through Athletic Pursuits",
  intro:
    "Sports at K.S.R.M. College of Engineering is an integral part of campus life, promoting physical fitness, team spirit, and competitive excellence. With modern facilities and dedicated coaching staff, our college encourages students to participate in both indoor and outdoor sports, fostering holistic development.",
  facilities: [
    {
      name: "Basketball Court",
      type: "outdoor",
      description: "Full-size international basketball court with professional lighting and seating.",
      capacity: "500",
    },
    {
      name: "Tennis Courts",
      type: "outdoor",
      description: "Four all-weather tennis courts with professional surface and lighting.",
      capacity: "200",
    },
    {
      name: "Football Ground",
      type: "outdoor",
      description: "Full-size football pitch with natural grass, lighting, and spectator stand.",
      capacity: "1,000+",
    },
    {
      name: "Cricket Ground",
      type: "outdoor",
      description: "International standard cricket ground with practice nets and pavilion.",
      capacity: "2,000+",
    },
    {
      name: "Badminton Hall",
      type: "indoor",
      description: "Air-conditioned badminton courts with professional flooring and lighting.",
      capacity: "300",
    },
    {
      name: "Gymnasium",
      type: "indoor",
      description:
        "State-of-the-art gymnasium with cardio, strength training, and CrossFit equipment.",
      capacity: "150",
    },
    {
      name: "Table Tennis Hall",
      type: "indoor",
      description: "Modern table tennis facility with 8 professional tables.",
      capacity: "100",
    },
    {
      name: "Swimming Pool",
      type: "outdoor",
      description: "Olympic-size swimming pool with dedicated coaching staff.",
      capacity: "400",
    },
  ],
  achievements: [
    {
      year: "2024",
      event: "Inter-College Basketball Tournament",
      level: "state",
      result: "Winners (Men's & Women's)",
      players: ["Basketball Team"],
    },
    {
      year: "2024",
      event: "All-India Engineering Games Cricket",
      level: "national",
      result: "Runners-up (Men's)",
      players: ["Cricket Team"],
    },
    {
      year: "2023",
      event: "JNTUA Sports Championships",
      level: "university",
      result: "Overall Champions",
      players: ["All Sports Teams"],
    },
    {
      year: "2023",
      event: "Marathon Championship",
      level: "state",
      result: "Top 3 Finishers (10K & 21K)",
      players: ["Athletics Team"],
    },
    {
      year: "2022",
      event: "National Badminton Championship",
      level: "national",
      result: "Semi-finalists (Doubles)",
      players: ["Badminton Team"],
    },
    {
      year: "2022",
      event: "Volleyball Tournament",
      level: "state",
      result: "Winners (Women's)",
      players: ["Volleyball Team"],
    },
  ],
  upcomingEvents: [
    {
      name: "Inter-Class Football Tournament",
      date: "15-22 July 2025",
      venue: "College Football Ground",
    },
    {
      name: "Summer Sports Fest",
      date: "1-10 August 2025",
      venue: "Sports Complex",
    },
    {
      name: "Annual Marathon",
      date: "25 August 2025",
      venue: "Campus",
    },
  ],
  coordinator: {
    name: "Dr. [Sports Coordinator]",
    phone: "+91-8554-233333 (Ext: 340)",
    email: "sports@ksrmce.ac.in",
  },
}
