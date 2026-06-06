export interface Facility {
  name: string
  description: string
  icon: string
  category: string
}

export interface CampusFacilitiesData {
  pageTitle: string
  subtitle: string
  intro: string
  stats: {
    campusArea: string
    buildings: number
    labs: string
    classrooms: string
  }
  facilities: Facility[]
  categories: string[]
  contact: {
    office: string
    phone: string
    email: string
  }
}

export const campusFacilities: CampusFacilitiesData = {
  pageTitle: "Campus Facilities",
  subtitle: "A world-class campus built for academic and personal excellence",
  intro:
    "Spread across a lush green campus in Kadapa, KSRM College of Engineering provides state-of-the-art infrastructure and facilities to support the overall development of students. Our modern campus features academic buildings, residential facilities, recreation areas, and essential amenities.",
  stats: {
    campusArea: "25 Acres",
    buildings: 12,
    labs: "60+",
    classrooms: "80+",
  },
  facilities: [
    {
      name: "Classrooms",
      description:
        "Spacious, well-ventilated classrooms equipped with projectors, smart boards and adequate seating for effective learning",
      icon: "School",
      category: "Academic",
    },
    {
      name: "Computer Labs",
      description:
        "Modern computer labs with high-end workstations, licensed software and 24/7 high-speed internet connectivity",
      icon: "Monitor",
      category: "Academic",
    },
    {
      name: "Research Labs",
      description:
        "Dedicated research laboratories in each department for advanced experimentation and innovation",
      icon: "FlaskConical",
      category: "Academic",
    },
    {
      name: "Central Library",
      description:
        "A knowledge hub with 45,000+ books, journals, digital resources and a quiet reading environment",
      icon: "BookOpen",
      category: "Academic",
    },
    {
      name: "Seminar Halls",
      description:
        "Air-conditioned seminar halls with audio-visual equipment for conferences, workshops and events",
      icon: "Presentation",
      category: "Academic",
    },
    {
      name: "Boys Hostel",
      description:
        "On-campus accommodation for 300+ boys with mess, Wi-Fi, security and recreational facilities",
      icon: "BedDouble",
      category: "Residential",
    },
    {
      name: "Girls Hostel",
      description:
        "Safe on-campus accommodation for 200+ girls with 24/7 CCTV surveillance and dedicated warden",
      icon: "BedDouble",
      category: "Residential",
    },
    {
      name: "Canteen & Mess",
      description:
        "Hygienic, affordable food served in the campus canteen and hostel mess — vegetarian and non-vegetarian options",
      icon: "UtensilsCrossed",
      category: "Amenities",
    },
    {
      name: "Medical Centre",
      description: "First aid and health services available on campus with doctor on call",
      icon: "HeartPulse",
      category: "Amenities",
    },
    {
      name: "ATM",
      description: "ATM facility available within campus premises for the convenience of students and staff",
      icon: "CreditCard",
      category: "Amenities",
    },
    {
      name: "Sports Complex",
      description:
        "Indoor sports hall, cricket ground, football field, basketball and volleyball courts for athletic pursuits",
      icon: "Trophy",
      category: "Sports & Recreation",
    },
    {
      name: "Auditorium",
      description:
        "Large auditorium for convocations, cultural events, seminars and college functions with modern facilities",
      icon: "Mic",
      category: "Events",
    },
    {
      name: "Transport Fleet",
      description:
        "Fleet of 25+ buses connecting Kadapa city and surrounding districts for students and staff transportation",
      icon: "Bus",
      category: "Amenities",
    },
    {
      name: "Wi-Fi Campus",
      description: "High-speed Wi-Fi connectivity across academic buildings and hostels for seamless connectivity",
      icon: "Wifi",
      category: "Amenities",
    },
    {
      name: "CCTV Surveillance",
      description:
        "Round-the-clock CCTV monitoring across all campus areas for safety and security of students and staff",
      icon: "Shield",
      category: "Amenities",
    },
    {
      name: "Power Backup",
      description:
        "Uninterrupted power supply through generators ensuring 24/7 power availability for all campus operations",
      icon: "Zap",
      category: "Amenities",
    },
  ],
  categories: ["All", "Academic", "Residential", "Amenities", "Sports & Recreation", "Events"],
  contact: {
    office: "Campus Administration",
    phone: "+91 9000073434",
    email: "principal@ksrmce.ac.in",
  },
}
