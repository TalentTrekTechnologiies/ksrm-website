export interface Hostel {
  name: string
  type: "boys" | "girls"
  capacity: string
  rooms: string
  amenities: string[]
  warden: {
    name: string
    phone: string
  }
  feePerYear: string
}

export interface Facility {
  name: string
  description: string
}

export interface AdmissionStep {
  step: string
  description: string
}

export interface HostelsData {
  pageTitle: string
  subtitle: string
  intro: string
  hostels: Hostel[]
  facilities: Facility[]
  admissionProcess: AdmissionStep[]
  rules: string[]
  contact: {
    office: string
    phone: string
    email: string
  }
}

export const hostels: HostelsData = {
  pageTitle: "Hostels",
  subtitle: "Comfortable Living on Campus",
  intro:
    "K.S.R.M. College of Engineering provides well-maintained hostel facilities for both boys and girls, offering a home away from home. Our hostels are equipped with modern amenities, 24/7 security, and dedicated wardens ensuring a safe and conducive environment for academic excellence.",
  hostels: [
    {
      name: "Boys Hostel",
      type: "boys",
      capacity: "400+",
      rooms: "Single & Double Occupancy",
      amenities: [
        "Wi-Fi & Internet",
        "Mess Facility",
        "24/7 Security",
        "Sports Facilities",
        "Common Room",
        "Recreational Area",
      ],
      warden: {
        name: "Mr. [Warden Name]",
        phone: "+91-8554-233333 (Ext: 310)",
      },
      feePerYear: "₹60,000 - ₹80,000",
    },
    {
      name: "Girls Hostel",
      type: "girls",
      capacity: "150+",
      rooms: "Single & Double Occupancy",
      amenities: [
        "Wi-Fi & Internet",
        "Mess Facility",
        "24/7 Security",
        "Yoga Studio",
        "Common Room",
        "Beauty Parlor",
      ],
      warden: {
        name: "Ms. [Warden Name]",
        phone: "+91-8554-233333 (Ext: 320)",
      },
      feePerYear: "₹60,000 - ₹80,000",
    },
  ],
  facilities: [
    {
      name: "Mess Facility",
      description:
        "Hygienic mess with nutritious meals (vegetarian & non-vegetarian) served thrice daily. Special menus for festivals and dietary requirements.",
    },
    {
      name: "Internet & Wi-Fi",
      description:
        "High-speed Wi-Fi connectivity in all rooms and common areas for academic and recreational purposes.",
    },
    {
      name: "Security",
      description:
        "24/7 CCTV surveillance, trained security personnel, and strict entry/exit protocols ensure safety.",
    },
    {
      name: "Sports & Recreation",
      description:
        "Indoor games, outdoor sports facilities, gymnasium, and recreational areas for student wellness.",
    },
    {
      name: "Medical Support",
      description:
        "On-campus medical facility with trained medical staff for emergency healthcare and health checkups.",
    },
    {
      name: "Laundry Service",
      description:
        "Professional laundry service available at nominal charges with quick turnaround.",
    },
  ],
  admissionProcess: [
    {
      step: "Application",
      description:
        "Submit hostel application form along with required documents during admission process.",
    },
    {
      step: "Verification",
      description:
        "Documents verified by hostel administration for eligibility and allocation.",
    },
    {
      step: "Allocation",
      description:
        "Room allocation based on merit, category, and availability on first-come-first-served basis.",
    },
    {
      step: "Fee Payment",
      description:
        "Hostel fee paid through college account or online payment portal.",
    },
    {
      step: "Check-in",
      description:
        "Report to hostel warden with necessary documents for final check-in and room possession.",
    },
  ],
  rules: [
    "Students must follow hostel timing and curfew rules as notified by hostel administration.",
    "Ragging of any form is strictly prohibited. Strict action will be taken against offenders.",
    "Cleanliness and maintenance of rooms and common areas is the responsibility of all students.",
    "Alcoholic beverages, tobacco, and non-vegetarian food are strictly prohibited in hostels.",
    "Guests are allowed only in common areas and must leave before 6:00 PM.",
    "Electrical appliances like heaters, cookers, and irons are not permitted in rooms.",
    "Noise and disturbance during study hours (9:00 PM - 7:00 AM) are strictly prohibited.",
    "Damaged property will be charged to the responsible student as per hostel rates.",
    "Drug abuse of any form will result in immediate expulsion from hostel.",
    "Students must maintain good conduct and abide by all college and hostel rules.",
  ],
  contact: {
    office: "Hostel Administration Office",
    phone: "+91-8554-233333 (Ext: 300)",
    email: "hostels@ksrmce.ac.in",
  },
}
