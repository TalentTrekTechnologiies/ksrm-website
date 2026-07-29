export interface EDCActivity {
  name: string
  description: string
}

export interface EDCEvent {
  name: string
  date: string
  description: string
  outcome: string
}

export interface StartupIncubated {
  name: string
  founder: string
  year: string
  domain: string
  status: string
}

export interface EDCData {
  pageTitle: string
  subtitle: string
  intro: string
  vision: string
  mission: string
  activities: EDCActivity[]
  events: EDCEvent[]
  startupsIncubated: StartupIncubated[]
  coordinator: {
    name: string
    designation: string
    phone: string
    email: string
  }
}

export const edc: EDCData = {
  pageTitle: "EDC (Entrepreneurship Development Cell)",
  subtitle: "Nurturing Future Entrepreneurs",
  intro:
    "The Entrepreneurship Development Cell (EDC) at K.S.R.M. College of Engineering is dedicated to fostering an entrepreneurial mindset among students. We provide mentorship, resources, and a supportive ecosystem for aspiring entrepreneurs to transform their innovative ideas into viable business ventures.",
  vision:
    "To create a vibrant entrepreneurial ecosystem within the college that nurtures innovation, fosters startups, and produces competent, ethical entrepreneurs ready to solve real-world problems.",
  mission:
    "To identify and mentor aspiring entrepreneurs, provide business development support, facilitate access to funding and networks, and celebrate entrepreneurial achievements among the college community.",
  activities: [
    {
      name: "Startup Workshops",
      description:
        "Regular workshops on business planning, market research, financial management, and startup fundamentals led by successful entrepreneurs.",
    },
    {
      name: "Idea Hackathons",
      description:
        "Ideation competitions where students pitch innovative business ideas and receive feedback from industry experts.",
    },
    {
      name: "Mentorship Program",
      description:
        "One-on-one mentoring sessions with experienced entrepreneurs and business leaders to guide startup journey.",
    },
    {
      name: "Business Plan Competition",
      description:
        "Annual competition where teams develop comprehensive business plans with potential for seed funding.",
    },
    {
      name: "Industry Interactions",
      description:
        "Networking sessions and interactions with successful startups, investors, and venture capitalists.",
    },
    {
      name: "Resource Hub",
      description:
        "Access to business incubation facilities, coworking space, and tools for startup development.",
    },
  ],
  events: [
    {
      name: "StartupFest 2024",
      date: "January 2024",
      description: "Annual entrepreneurship festival showcasing student startups and innovations.",
      outcome: "15 startups presented, 3 secured seed funding",
    },
    {
      name: "Pitch Perfect Competition",
      date: "March 2024",
      description: "Elevator pitch competition for innovative business ideas.",
      outcome: "50 participants, 10 selected for incubation",
    },
    {
      name: "Expert Talk Series",
      date: "Monthly",
      description: "Sessions with successful entrepreneurs sharing their journey and insights.",
      outcome: "200+ students attended, inspired multiple startup ideas",
    },
  ],
  startupsIncubated: [
    {
      name: "TechSolve Analytics",
      founder: "Rakesh K.",
      year: "2022",
      domain: "Data Analytics & AI",
      status: "Series A Funding",
    },
    {
      name: "EcoPackaging Solutions",
      founder: "Priya M.",
      year: "2023",
      domain: "Sustainable Packaging",
      status: "Active, ₹50L Revenue",
    },
    {
      name: "SkillBridge Learning",
      founder: "Arun & Team",
      year: "2023",
      domain: "EdTech",
      status: "Seed Stage",
    },
    {
      name: "AgriConnect Platform",
      founder: "Laxmi P.",
      year: "2024",
      domain: "AgriBusiness Tech",
      status: "Incubation",
    },
  ],
  coordinator: {
    name: "Dr. [EDC Coordinator]",
    designation: "Coordinator, EDC",
    phone: "+91-8554-233333 (Ext: 360)",
    email: "edc@ksrmce.ac.in",
  },
}
