export interface Service {
  name: string
  description: string
}

export interface SuccessStory {
  name: string
  founder: string
  domain: string
  funding?: string
  description: string
}

export interface ApplicationStep {
  step: string
}

export interface StartupCellStats {
  startupsSupported: string
  fundingRaised: string
  mentors: string
  patents: string
}

export interface StartupCellData {
  pageTitle: string
  subtitle: string
  intro: string
  about: string
  stats: StartupCellStats
  services: Service[]
  successStories: SuccessStory[]
  applicationProcess: ApplicationStep[]
  contact: {
    coordinator: string
    phone: string
    email: string
  }
}

export const startupCell: StartupCellData = {
  pageTitle: "Startup Cell",
  subtitle: "From Idea to Impact",
  intro:
    "The Startup Cell at K.S.R.M. College of Engineering is a dedicated initiative to support student entrepreneurs in transforming their ideas into commercially viable startups. We provide comprehensive support including incubation facilities, mentorship, funding assistance, and market access.",
  about:
    "The Startup Cell functions as a bridge between innovative student ideas and real-world market opportunities. We work with a network of experienced mentors, investors, and industry experts to provide holistic support for early-stage startups. Our focus is on creating sustainable businesses with positive social and environmental impact.",
  stats: {
    startupsSupported: "25+",
    fundingRaised: "₹2+ Crore",
    mentors: "40+",
    patents: "8",
  },
  services: [
    {
      name: "Incubation Space",
      description: "Dedicated workspace with high-speed internet, collaborative areas, and necessary infrastructure.",
    },
    {
      name: "Mentorship Program",
      description: "Access to experienced entrepreneurs, investors, and industry experts for guidance and support.",
    },
    {
      name: "Funding Assistance",
      description: "Help with securing seed funding, grants, and connecting with venture capitalists and angel investors.",
    },
    {
      name: "Legal & Compliance",
      description: "Support with company registration, IP protection, patents, and regulatory compliance.",
    },
    {
      name: "Business Development",
      description: "Market research, business model validation, product development, and go-to-market strategy.",
    },
    {
      name: "Networking Events",
      description: "Regular pitch events, investor meets, networking sessions, and industry conferences.",
    },
  ],
  successStories: [
    {
      name: "SmartAg Analytics",
      founder: "Vikram S.",
      domain: "AgriTech",
      funding: "Series A - ₹75L",
      description:
        "AI-powered agricultural analytics platform helping farmers optimize crop yield. Now operating in 5 states with 2000+ users.",
    },
    {
      name: "HealthTech Solutions",
      founder: "Dr. Ananya M.",
      domain: "HealthTech",
      funding: "Pre-Series A - ₹50L",
      description:
        "Telemedicine and health monitoring platform. Secured funding and partnerships with 20+ hospitals.",
    },
    {
      name: "EduPrep Online",
      founder: "Rajesh & Team",
      domain: "EdTech",
      funding: "Seed - ₹30L",
      description:
        "Personalized test preparation platform. 50,000+ students registered with 95% success rate.",
    },
  ],
  applicationProcess: [
    { step: "Submit detailed business plan and pitch deck through online portal" },
    { step: "Initial screening and shortlisting of ideas by review committee" },
    { step: "Pitch presentation before investors and expert panel" },
    { step: "Due diligence and feasibility assessment" },
    { step: "Incubation agreement and formal onboarding" },
    { step: "Monthly mentoring sessions and performance reviews" },
  ],
  contact: {
    coordinator: "Dr. [Startup Cell Coordinator]",
    phone: "+91-8554-233333 (Ext: 370)",
    email: "startup@ksrmce.ac.in",
  },
}
