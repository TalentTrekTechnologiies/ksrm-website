export const hostelsData = {
  title: "Student Hostels",
  tagline: "Safe, Comfortable Living on Campus",
  banner: "/banners/hostel-banner.jpg",

  // DUMMY - confirm with client
  about:
    "KSRMCE provides separate, well-maintained hostel facilities for boys and girls within the campus. The hostels offer a safe, comfortable, and conducive environment for students to live and study, with modern amenities and round-the-clock security. Our hostels foster a sense of community and provide essential support for residential students.",

  hostels: [
    {
      name: "Boys' Hostel",
      type: "Male Students",
      description:
        "Spacious, well-furnished accommodation with dedicated study areas and recreational facilities.",
      capacity: "200+ Students", // DUMMY
      rooms: "Single, Double, Triple sharing options", // DUMMY
    },
    {
      name: "Girls' Hostel",
      type: "Female Students",
      description:
        "Secure, comfortable living spaces with modern amenities and supervised environment.",
      capacity: "150+ Students", // DUMMY
      rooms: "Single, Double, Triple sharing options", // DUMMY
    },
  ],

  // DUMMY - confirm with client
  facilities: [
    {
      icon: "🛏️",
      name: "Spacious Rooms",
      description: "Well-ventilated, comfortable rooms with modern furnishings",
    },
    {
      icon: "🍽️",
      name: "Nutritious Mess Food",
      description: "Hygienic, nutritious meals prepared by experienced kitchen staff",
    },
    {
      icon: "🔒",
      name: "24/7 Security",
      description:
        "Round-the-clock security personnel and CCTV surveillance for student safety",
    },
    {
      icon: "📶",
      name: "Wi-Fi Connectivity",
      description: "High-speed internet access in rooms and common areas",
    },
    {
      icon: "🎮",
      name: "Recreation Areas",
      description:
        "Game rooms, TV lounges, and outdoor sports facilities for leisure activities",
    },
    {
      icon: "⚕️",
      name: "Medical Care",
      description: "On-campus medical center with qualified staff for health support",
    },
    {
      icon: "🧺",
      name: "Laundry Services",
      description: "In-house laundry facilities with regular washing and ironing services",
    },
    {
      icon: "💧",
      name: "RO Drinking Water",
      description: "Pure, filtered drinking water available round-the-clock",
    },
    {
      icon: "📚",
      name: "Study Areas",
      description: "Quiet common rooms and reading halls for academic work",
    },
    {
      icon: "🔧",
      name: "Maintenance & Upkeep",
      description: "Regular maintenance and housekeeping to ensure cleanliness",
    },
  ],

  // DUMMY - confirm with client
  rulesAndRegulations: [
    "Students must maintain discipline and follow hostel regulations",
    "Curfew timings strictly enforced for safety",
    "Unauthorized guests and overnight visitors not permitted",
    "Smoking, alcohol, and drugs strictly prohibited",
    "Common areas must be kept clean and litter-free",
    "Electrical appliances usage as per hostel guidelines",
    "Hostel fees payable as per college schedule",
    "Grievances addressed through hostel committee",
  ],

  // DUMMY - confirm with client
  fees: {
    title: "Hostel Fees", // DUMMY - actual rates from college
    description: "Hostel charges include accommodation, meals, and essential utilities",
    note: "// Confirm exact fee structure and payment schedule with college",
    typical: "₹ [TBD - confirm with college]",
  },

  contact: {
    boysHostelWarden: {
      name: "Dr. [Name]", // DUMMY
      designation: "Boys Hostel Warden",
      email: "hostels@ksrmce.ac.in", // DUMMY
      phone: "[Phone - confirm with college]", // DUMMY
    },
    girlsHostelWarden: {
      name: "Dr. [Name]", // DUMMY
      designation: "Girls Hostel Warden",
      email: "hostels@ksrmce.ac.in", // DUMMY
      phone: "[Phone - confirm with college]", // DUMMY
    },
  },

  applicationProcess: {
    title: "How to Apply for Hostel",
    steps: [
      "Submit hostel application during specified window",
      "Provide required documents and proof of residence",
      "Merit-based selection (priority for outstation students)",
      "Pay hostel fees to confirm admission",
      "Collect hostel allotment letter",
      "Report at hostel on scheduled date",
    ],
  },
}
