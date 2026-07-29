export interface NSSActivity {
  name: string
  description: string
}

export interface NSSAchievement {
  year: string
  award: string
  level: string
}

export interface NSSStats {
  volunteers: string
  campsHeld: string
  treesPlanted: string
  villagesAdopted: string
}

export interface NSSData {
  pageTitle: string
  subtitle: string
  intro: string
  aboutNSS: string
  stats: NSSStats
  activities: NSSActivity[]
  achievements: NSSAchievement[]
  programmeOfficer: {
    name: string
    designation: string
    phone: string
    email: string
  }
}

export const nss: NSSData = {
  pageTitle: "NSS (National Service Scheme)",
  subtitle: "Service Beyond Self",
  intro:
    "The National Service Scheme (NSS) at K.S.R.M. College of Engineering is dedicated to fostering a spirit of public service and social responsibility among students. Our NSS unit works in close collaboration with local communities, organizing various social welfare programmes and environmental initiatives.",
  aboutNSS:
    "The National Service Scheme is a flagship programme of the Government of India aimed at developing character, discipline, and secular outlook among students. NSS volunteers engage in community service and social development activities, promoting a sense of patriotism and social consciousness. Through structured programmes and grassroots involvement, NSS instills values of social responsibility and commitment to nation-building.",
  stats: {
    volunteers: "250+",
    campsHeld: "45",
    treesPlanted: "5,000+",
    villagesAdopted: "3",
  },
  activities: [
    {
      name: "Community Service",
      description:
        "Regular visits to nearby villages for health awareness, sanitation drives, and educational support programs.",
    },
    {
      name: "Environmental Conservation",
      description:
        "Tree plantation drives, waste management awareness, and sustainable development initiatives.",
    },
    {
      name: "Education Support",
      description:
        "Coaching centers for underprivileged children, literacy programs, and skill development workshops.",
    },
    {
      name: "Health Awareness",
      description:
        "Medical camps, health seminars, nutrition awareness, and health checkup programs in villages.",
    },
    {
      name: "Disaster Relief",
      description:
        "Rapid response to natural calamities with relief materials, rehabilitation support, and community rebuilding.",
    },
    {
      name: "Cultural Programmes",
      description:
        "Organization of cultural events to promote social cohesion and preserve local traditions.",
    },
  ],
  achievements: [
    {
      year: "2024",
      award: "Best NSS Unit Award",
      level: "University",
    },
    {
      year: "2023",
      award: "Social Service Excellence",
      level: "State",
    },
    {
      year: "2022",
      award: "Environmental Conservation Award",
      level: "District",
    },
    {
      year: "2021",
      award: "Community Service Recognition",
      level: "University",
    },
  ],
  programmeOfficer: {
    name: "Dr. [NSS Officer Name]",
    designation: "NSS Programme Officer",
    phone: "+91-8554-233333 (Ext: 350)",
    email: "nss@ksrmce.ac.in",
  },
}
